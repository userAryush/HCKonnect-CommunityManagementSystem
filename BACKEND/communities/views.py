from rest_framework import status
from rest_framework.generics import CreateAPIView, ListAPIView, RetrieveAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import CommunityMembership,CommunityVacancy,VacancyApplication
from .serializers import CommunityMembershipCreateSerializer, CommunityMemberListSerializer, CommunityListSerializer,CommunityVacancySerializer,CommunityDashboardSerializer, StudentListSerializer,VacancyApplicationSerializer
from rest_framework.exceptions import NotFound, PermissionDenied
from django.contrib.auth import get_user_model
from contents.permissions import CanCreateCommunityContent
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q, Count, Sum, F
from .permissions import IsCommunityAccount, CanManageVacancy, IsNotPlatformCommunity, CanApplyToVacancy
from .platform import is_platform_community
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from contents.models import Announcement, Post, PostComment, PostReaction
from events.models import Event
from discussion.models import DiscussionPanel, DiscussionReply, Reaction as DiscussionReaction
from utils.email_utils import send_branded_email
from notifications.models import Notification
from django.conf import settings
from utils.pagination import StandardPagination
from services.cache import invalidate_membership_caches, invalidate_vacancy_caches
from services.cache.community_page_cache import (
    build_paginated_list_payload,
    dashboard_page_params_match,
    get_cached_community_page,
)
from .dashboard_cache import get_cached_dashboard

User = get_user_model()


# --------------------------
# Community Vacancy Views
# --------------------------

class CreateCommunityVacancyView(CreateAPIView):
    queryset = CommunityVacancy.objects.all()
    serializer_class = CommunityVacancySerializer
    permission_classes = [CanCreateCommunityContent, IsNotPlatformCommunity]

    def perform_create(self, serializer):
        vacancy = serializer.save()
        invalidate_vacancy_caches(vacancy)

class ManageCommunityVacancyView(RetrieveUpdateDestroyAPIView):
    queryset = CommunityVacancy.objects.all()
    serializer_class = CommunityVacancySerializer
    permission_classes = [CanManageVacancy]

    def perform_update(self, serializer):
        vacancy = serializer.save()
        invalidate_vacancy_caches(vacancy)

    def destroy(self, request, *args, **kwargs):
        vacancy = self.get_object()
        # If the vacancy is already closed, a DELETE request will now permanently delete it.
        if vacancy.status == CommunityVacancy.STATUS_CLOSED:
            invalidate_vacancy_caches(vacancy)
            vacancy.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        
        # If it's open, a DELETE request will close it (existing behavior).
        vacancy.status = CommunityVacancy.STATUS_CLOSED
        vacancy.save(update_fields=["status", "is_open", "updated_at"])
        invalidate_vacancy_caches(vacancy)
        serializer = self.get_serializer(vacancy)
        return Response(serializer.data, status=status.HTTP_200_OK)

class PublicVacancyDetailView(RetrieveAPIView):
    """
    Read a single vacancy by id (for public detail page). Open or closed; serializer exposes is_open.
    """

    queryset = CommunityVacancy.objects.select_related("community").all()
    serializer_class = CommunityVacancySerializer
    permission_classes = [AllowAny]


class ListCommunityVacanciesView(ListAPIView):
    serializer_class = CommunityVacancySerializer
    pagination_class = StandardPagination
    # permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        community_id = request.query_params.get("community_id")
        status_filter = request.query_params.get("status", "ALL").upper()
        sort_by = request.query_params.get("sort", "-created_at")
        if (
            community_id
            and status_filter == "ALL"
            and sort_by in ("-created_at", "newest")
            and dashboard_page_params_match(request)
        ):
            data = get_cached_community_page(
                community_id,
                "vacancies:ALL:-created_at",
                lambda: build_paginated_list_payload(self),
                log_label="vacancies",
            )
            return Response(data)
        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        community_id = self.request.query_params.get('community_id')
        status_filter = self.request.query_params.get('status', 'ALL').upper()
        sort_by = self.request.query_params.get('sort', '-created_at') # Default to newest

        # Base queryset for all vacancies (exclude platform communities)
        queryset = CommunityVacancy.objects.select_related("community").filter(
            community__is_platform_community=False
        )

        # Filter by status if not 'ALL'
        if status_filter in {CommunityVacancy.STATUS_OPEN, CommunityVacancy.STATUS_CLOSED}:
            queryset = queryset.filter(status=status_filter)

        # Filter by community if ID is provided
        if community_id:
            queryset = queryset.filter(community_id=community_id)
        # If no community_id, apply role-based filtering
        elif self.request.user.is_authenticated:
            if self.request.user.role == "student":
                pass # Students can see all public vacancies
            elif self.request.user.role == "community":
                queryset = queryset.filter(community=self.request.user)
            else: # e.g., representatives
                membership = getattr(self.request.user, "membership", None)
                if membership:
                    queryset = queryset.filter(community=membership.community)
                else:
                    return CommunityVacancy.objects.none()
        else:
            # For unauthenticated users, show all open vacancies
            queryset = queryset.filter(status=CommunityVacancy.STATUS_OPEN)


        # Apply sorting
        if sort_by == 'newest':
            queryset = queryset.order_by('-created_at')
        elif sort_by == 'oldest':
            queryset = queryset.order_by('created_at')
        else:
            queryset = queryset.order_by(sort_by) # Default sort

        return queryset

# --------------------------
# Vacancy Application Views
# --------------------------

class ApplyVacancyView(CreateAPIView):
    serializer_class = VacancyApplicationSerializer
    permission_classes = [CanApplyToVacancy]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ListVacancyApplicationsView(ListAPIView):
    serializer_class = VacancyApplicationSerializer
    permission_classes = [CanCreateCommunityContent]
    pagination_class = StandardPagination

    def get_queryset(self):
        user = self.request.user
        vacancy_id = self.request.query_params.get('vacancy_id')
        
        # Determine which community's data to look at
        membership = getattr(user, 'membership', None)
        if user.role == "community":
            target_community = user
        elif membership and membership.role == "representative":
            target_community = membership.community
        else:
            return VacancyApplication.objects.none()

        queryset = VacancyApplication.objects.filter(vacancy__community=target_community)

        # If they asked for a specific vacancy, filter it down
        if vacancy_id:
            queryset = queryset.filter(vacancy_id=vacancy_id)
            
        return queryset


# Member Management
class ListCommunityMembersView(ListAPIView):
    """
    This view is dynamic: it serves both the Community Managers (to see their own) 
    and the Students/Admins (to see specific communities).
    """
    serializer_class = CommunityMemberListSerializer
    # permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Used for URLs like: /members/?community_id=5
        # Or captured from the path if using: /<int:community_id>/members/
        community_id = self.request.query_params.get('community_id') or self.kwargs.get('community_id')
        
        if community_id:
            community = User.objects.filter(id=community_id, role="community").first()
            if community and is_platform_community(community):
                return CommunityMembership.objects.none()
            return CommunityMembership.objects.filter(community_id=community_id).select_related('user')
        
        # If no specific ID is requested, we check if the logged-in user is a Community account.
        if self.request.user.role == "community":
            # If so, show them ONLY their own members.
            return CommunityMembership.objects.filter(community=self.request.user).select_related('user')
        
        return CommunityMembership.objects.none()


class AddCommunityMemberView(CreateAPIView):
    serializer_class = CommunityMembershipCreateSerializer
    permission_classes = [IsCommunityAccount, IsNotPlatformCommunity]

    def perform_create(self, serializer):
        serializer.save()
        invalidate_membership_caches(self.request.user.id)

class UpdateCommunityMemberRoleView(APIView):
    permission_classes = [IsCommunityAccount, IsNotPlatformCommunity]

    def patch(self, request, membership_id):
        # We find the membership by ID AND ensure it belongs to the logged-in community
        membership = get_object_or_404(
            CommunityMembership, 
            pk=membership_id, 
            community=request.user
        )
        
        new_role = request.data.get('role')
        valid_roles = ['member', 'representative'] # Add other roles if you have them

        if new_role not in valid_roles:
            return Response({"error": "Invalid role specified."}, status=400)

        membership.role = new_role
        membership.save()
        
        return Response({"message": "Role updated successfully."}, status=200)
    
class RemoveCommunityMemberView(APIView):
    permission_classes = [IsCommunityAccount, IsNotPlatformCommunity]
    
    def delete(self, request, membership_id):
        # We don't just search by 'id=membership_id'. 
        # We also filter by 'community=request.user'.
        # This prevents Community A from deleting a member from Community B by guessing their ID.
        membership = get_object_or_404(CommunityMembership, id=membership_id, community=request.user)
        membership.delete()
        invalidate_membership_caches(request.user.id)
        return Response({"message": "Member removed."}, status=204)

class StudentListView(ListAPIView):
    serializer_class = StudentListSerializer
    # permission_classes = [AllowAny]  

    def get_queryset(self):
        search = (self.request.GET.get("search", "") or "").strip()
        queryset = User.objects.filter(role="student")

        if not search:
            return queryset.order_by("username")[:20]

        # Support searching by full name, first name, last name, username, and email.
        # For multi-word input (e.g., "john doe"), each token must match at least one field.
        terms = [term for term in search.split() if term]
        for term in terms:
            queryset = queryset.filter(
                Q(first_name__icontains=term) |
                Q(last_name__icontains=term) |
                Q(username__icontains=term) |
                Q(email__icontains=term)
            )

        return queryset.order_by("username")[:20]  # limit 20 results

class CommunityListView(ListAPIView):
    serializer_class = CommunityListSerializer
    permission_classes =[AllowAny]

    def get_queryset(self):
        return User.objects.filter(role="community",status="active").order_by("community_name")

class CommunityDashboardView(RetrieveAPIView):
    """
    API to fetch community dashboard data.
    Only accessible to users with role='community'.
    """
    serializer_class = CommunityDashboardSerializer
    # permission_classes = [AllowAny]

    def get_object(self):
        community_id = self.kwargs.get("pk")
        user = (
            User.objects.filter(id=community_id, role="community")
            .prefetch_related("members")
            .first()
        )
        if not user:
            raise NotFound("Community not found.")
        return user

    def retrieve(self, request, *args, **kwargs):
        community_id = self.kwargs.get("pk")

        def fetch_dashboard_from_db():
            instance = self.get_object()
            return self.get_serializer(instance).data

        data = get_cached_dashboard(community_id, request, fetch_dashboard_from_db)
        return Response(data)


class CommunityAnalyticsView(APIView):
    """
    Optimized API to fetch analytics for the community dashboard.
    Returns engagement metrics, member activity, and activity trends.
    Platform communities receive system-wide overview metrics.
    """
    permission_classes = [IsCommunityAccount]

    def _build_activity_trend(self, start_date, last_7_days, querysets):
        trend_map = {date: 0 for date in last_7_days}
        for qs in querysets:
            for entry in qs:
                trend_map[entry['created_at__date']] += entry['count']
        posts_last_7_days = [
            {"date": d.strftime("%Y-%m-%d"), "count": trend_map[d]}
            for d in last_7_days
        ]
        return posts_last_7_days, sum(trend_map.values())

    def _get_platform_analytics(self, request, community, now, start_date, last_7_days):
        student_communities = User.objects.filter(
            role='community', status='active', is_platform_community=False
        )
        total_students = User.objects.filter(role='student', status='active').count()
        total_communities = student_communities.count()

        posts_last_7_days, total_engagements = self._build_activity_trend(
            start_date,
            last_7_days,
            [
                Post.objects.filter(created_at__date__gte=start_date).values('created_at__date').annotate(count=Count('id')),
                DiscussionPanel.objects.filter(created_at__date__gte=start_date).values('created_at__date').annotate(count=Count('id')),
                Announcement.objects.filter(created_at__date__gte=start_date).values('created_at__date').annotate(count=Count('id')),
                Event.objects.filter(created_at__date__gte=start_date).values('created_at__date').annotate(count=Count('id')),
                PostComment.objects.filter(created_at__date__gte=start_date).values('created_at__date').annotate(count=Count('id')),
                DiscussionReply.objects.filter(created_at__date__gte=start_date).values('created_at__date').annotate(count=Count('id')),
                PostReaction.objects.filter(created_at__date__gte=start_date).values('created_at__date').annotate(count=Count('id')),
                DiscussionReaction.objects.filter(created_at__date__gte=start_date).values('created_at__date').annotate(count=Count('id')),
            ],
        )

        comparison_qs = student_communities.annotate(
            a_count=Count('community_announcements', distinct=True),
            e_count=Count('events', distinct=True),
            d_count=Count('community_discussions', distinct=True),
        ).annotate(
            score=F('a_count') + F('e_count') + F('d_count')
        ).order_by('-score')[:10]

        comparison_data = [
            {
                "name": c.community_name or c.username,
                "score": c.score,
                "isCurrent": False,
            }
            for c in comparison_qs
        ]

        member_counts_qs = student_communities.annotate(
            member_count=Count('members', distinct=True),
        ).order_by('-member_count', 'community_name')[:12]

        community_member_counts = [
            {
                "name": c.community_name or c.username,
                "value": c.member_count,
            }
            for c in member_counts_qs
        ]

        daily_limit = now - timedelta(hours=24)
        weekly_limit = now - timedelta(days=7)
        member_activity = User.objects.filter(role='student', status='active').aggregate(
            daily=Count('id', filter=Q(last_login__gte=daily_limit)),
            weekly=Count('id', filter=Q(last_login__lt=daily_limit, last_login__gte=weekly_limit)),
            rare=Count('id', filter=Q(last_login__lt=weekly_limit) | Q(last_login__isnull=True)),
        )

        return {
            "is_platform_analytics": True,
            "platform_overview": {
                "total_students": total_students,
                "total_communities": total_communities,
            },
            "engagement": {
                "announcements": Announcement.objects.count(),
                "events": Event.objects.count(),
                "posts": Post.objects.count(),
                "discussions": DiscussionPanel.objects.count(),
            },
            "member_activity": member_activity,
            "top_members": [],
            "posts_last_7_days": posts_last_7_days,
            "total_engagements": total_engagements,
            "comparison": comparison_data,
            "community_member_counts": community_member_counts,
        }

    def _build_community_analytics_data(
        self, request, community, now, start_date, last_7_days
    ):
        community_id = community.id

        # 1. Engagement counts (Announcements, Events, Discussions)
        announcements_count = Announcement.objects.filter(community_id=community_id).count()
        events_count = Event.objects.filter(community_id=community_id).count()
        discussions_count = DiscussionPanel.objects.filter(community_id=community_id).count()

        # Member IDs for this community
        member_ids = list(CommunityMembership.objects.filter(community_id=community_id).values_list('user_id', flat=True))
        all_eligible_authors = member_ids + [community_id]

        # Total Posts
        posts_count = Post.objects.filter(author_id__in=all_eligible_authors).count()

        # 1.5 Member Interactions (Comments and Reactions)
        # Using separate queries for cleanliness and adding to trend later
        
        # 2. Member activity (Mutually Exclusive) - Now including the community owner
        daily_limit = now - timedelta(hours=24)
        weekly_limit = now - timedelta(days=7)

        # Include both members and the community account itself
        active_users = User.objects.filter(Q(membership__community_id=community_id) | Q(id=community_id))

        member_activity = active_users.aggregate(
            daily=Count('id', filter=Q(last_login__gte=daily_limit)),
            weekly=Count('id', filter=Q(last_login__lt=daily_limit, last_login__gte=weekly_limit)),
            rare=Count('id', filter=Q(last_login__lt=weekly_limit) | Q(last_login__isnull=True))
        )

        # 3. Comprehensive Performance Trend (Last 7 Days)
        # Includes: Announcements, Events, Posts, Discussions, Comments, Reactions
        
        # Fetching all activity by date
        daily_posts = Post.objects.filter(author_id__in=all_eligible_authors, created_at__date__gte=start_date).values('created_at__date').annotate(count=Count('id'))
        daily_discussions = DiscussionPanel.objects.filter(community_id=community_id, created_at__date__gte=start_date).values('created_at__date').annotate(count=Count('id'))
        daily_announcements = Announcement.objects.filter(community_id=community_id, created_at__date__gte=start_date).values('created_at__date').annotate(count=Count('id'))
        daily_events = Event.objects.filter(community_id=community_id, created_at__date__gte=start_date).values('created_at__date').annotate(count=Count('id'))
        
        # Comments across all content
        daily_p_comments = PostComment.objects.filter(author_id__in=all_eligible_authors, created_at__date__gte=start_date).values('created_at__date').annotate(count=Count('id'))
        daily_d_replies = DiscussionReply.objects.filter(created_by_id__in=all_eligible_authors, created_at__date__gte=start_date).values('created_at__date').annotate(count=Count('id'))
        
        # Reactions across all content
        daily_p_reactions = PostReaction.objects.filter(user_id__in=all_eligible_authors, created_at__date__gte=start_date).values('created_at__date').annotate(count=Count('id'))
        daily_d_reactions = DiscussionReaction.objects.filter(user_id__in=all_eligible_authors, created_at__date__gte=start_date).values('created_at__date').annotate(count=Count('id'))

        posts_last_7_days, total_engagements = self._build_activity_trend(
            start_date,
            last_7_days,
            [
                daily_posts,
                daily_discussions,
                daily_announcements,
                daily_events,
                daily_p_comments,
                daily_d_replies,
                daily_p_reactions,
                daily_d_reactions,
            ],
        )

        # 5. Global Community Comparison (Top 5 + Current)
        comparison = User.objects.filter(
            role='community', status='active', is_platform_community=False
        ).annotate(
            a_count=Count('community_announcements', distinct=True),
            e_count=Count('events', distinct=True),
            d_count=Count('community_discussions', distinct=True)
        ).annotate(
            score=F('a_count') + F('e_count') + F('d_count')
        ).order_by('-score')[:5]

        comparison_data = [
            {"name": c.community_name or c.username, "score": c.score, "isCurrent": c.id == community.id}
            for c in comparison
        ]
        
        # Ensure current community is in the list if not in top 5
        if not any(c['isCurrent'] for c in comparison_data):
            current_score = announcements_count + events_count + discussions_count
            comparison_data.append({
                "name": community.community_name or community.username,
                "score": current_score,
                "isCurrent": True
            })
            # Re-sort to keep it looking nice
            comparison_data = sorted(comparison_data, key=lambda x: x['score'], reverse=True)

        # 6. Top 5 Active Members
        top_memberships = CommunityMembership.objects.filter(
            community_id=community_id
        ).select_related('user').annotate(
            activity_score=Count('user__posts', distinct=True)
        ).order_by('-activity_score', '-user__last_login')[:5]

        top_members_data = [
            {
                "id": m.user.id,
                "username": m.user.username,
                "profile_image": request.build_absolute_uri(m.user.profile_image.url) if m.user.profile_image else None,
                "role": m.role,
                "activity_score": m.activity_score
            } for m in top_memberships
        ]

        return {
            "engagement": {
                "announcements": announcements_count,
                "events": events_count,
                "posts": posts_count,
                "discussions": discussions_count
            },
            "member_activity": member_activity,
            "top_members": top_members_data,
            "posts_last_7_days": posts_last_7_days,
            "total_engagements": total_engagements,
            "comparison": comparison_data
        }

    def build_analytics_data(self, request, pk):
        """
        Cached analytics payload shared by this view and CommunityDashboardSummaryView.
        Redis key: community_page:{pk}:analytics:v{version}
          or community_page:{pk}:analytics:platform:v{version}
        """
        community = get_object_or_404(User, id=pk, role="community")
        now = timezone.now()
        start_date = (now - timedelta(days=6)).date()
        last_7_days = [start_date + timedelta(days=i) for i in range(7)]

        if is_platform_community(community):
            suffix = "analytics:platform"
            fetch = lambda: self._get_platform_analytics(
                request, community, now, start_date, last_7_days
            )
        else:
            suffix = "analytics"
            fetch = lambda: self._build_community_analytics_data(
                request, community, now, start_date, last_7_days
            )

        return get_cached_community_page(pk, suffix, fetch, log_label="analytics")

    def get(self, request, pk):
        return Response(self.build_analytics_data(request, pk))


class SendCommunityMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        community_id = request.data.get("community_id")
        subject = request.data.get("subject")
        message = request.data.get("message")

        if not all([community_id, subject, message]):
            return Response({"error": "Missing required fields."}, status=400)

        community = get_object_or_404(User, id=community_id, role="community")
        
        # Send email to the community
        context = {
            "user_name": community.community_name or community.username,
            "message": f"You have received a new message from {request.user.first_name} {request.user.last_name} ({request.user.email}):\n\n{message}",
            "button_text": "View Community Dashboard",
            "button_url": f"{settings.FRONTEND_URL}/community/{community.id}/dashboard"
        }
        
        success = send_branded_email(
            subject=f"[HCKonnect] {subject}",
            to_email=community.email,
            context=context
        )

        if success:
            # Create a system notification for the community
            Notification.objects.create(
                recipient=community,
                actor=request.user,
                type='message',
                title='New Email Received',
                message=f"{request.user.first_name} {request.user.last_name} has sent you an email regarding: '{subject}'. Please check your email.",
                metadata={
                    "sender_id": str(request.user.id),
                    "sender_email": request.user.email,
                    "subject": subject
                }
            )
            return Response({"message": "Message sent successfully."}, status=200)
        return Response({"error": "Failed to send message."}, status=500)
