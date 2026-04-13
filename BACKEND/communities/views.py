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
from .permissions import IsCommunityAccount, CanManageVacancy
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from contents.models import Announcement, Post, PostComment, PostReaction
from events.models import Event
from discussion.models import DiscussionPanel, DiscussionReply, Reaction as DiscussionReaction
from utils.email_utils import send_branded_email
from notifications.models import Notification
from django.conf import settings

User = get_user_model()


# --------------------------
# Community Vacancy Views
# --------------------------

class CreateCommunityVacancyView(CreateAPIView):
    queryset = CommunityVacancy.objects.all()
    serializer_class = CommunityVacancySerializer
    permission_classes = [CanCreateCommunityContent]

class ManageCommunityVacancyView(RetrieveUpdateDestroyAPIView):
    queryset = CommunityVacancy.objects.all()
    serializer_class = CommunityVacancySerializer
    permission_classes = [CanManageVacancy]

class ListCommunityVacanciesView(ListAPIView):
    serializer_class = CommunityVacancySerializer
    # permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Allow filtering by a specific community via query param
        community_id = self.request.query_params.get('community_id')
        
        if community_id:
            return CommunityVacancy.objects.filter(community_id=community_id, is_open=True)
            
        # Default: Students see ALL open vacancies
        if self.request.user.role == "student":
            return CommunityVacancy.objects.filter(is_open=True)
            
        # Community accounts see their own (even closed ones)
        if self.request.user.role == "community":
            return CommunityVacancy.objects.filter(community=self.request.user)
            
        return CommunityVacancy.objects.none()

# --------------------------
# Vacancy Application Views
# --------------------------

class ApplyVacancyView(CreateAPIView):
    serializer_class = VacancyApplicationSerializer
    # permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != "student":
            raise PermissionDenied("Only students can apply to vacancies.")
        serializer.save(user=user)

class ListVacancyApplicationsView(ListAPIView):
    serializer_class = VacancyApplicationSerializer
    permission_classes = [CanCreateCommunityContent]

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
            # PUBLIC VIEW: Anyone logged in can see members of a specific community 
            # if they provide that community's ID.
            # .select_related('user') here to join the Student profile data in ONE query.
            return CommunityMembership.objects.filter(community_id=community_id).select_related('user')
        
        # If no specific ID is requested, we check if the logged-in user is a Community account.
        if self.request.user.role == "community":
            # If so, show them ONLY their own members.
            return CommunityMembership.objects.filter(community=self.request.user).select_related('user')
        
        return CommunityMembership.objects.none()


class AddCommunityMemberView(CreateAPIView):
    serializer_class = CommunityMembershipCreateSerializer
    permission_classes = [IsCommunityAccount]
    
class UpdateCommunityMemberRoleView(APIView):
    permission_classes = [IsCommunityAccount]

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
    permission_classes = [ IsCommunityAccount]
    
    def delete(self, request, membership_id):
        # We don't just search by 'id=membership_id'. 
        # We also filter by 'community=request.user'.
        # This prevents Community A from deleting a member from Community B by guessing their ID.
        membership = get_object_or_404(CommunityMembership, id=membership_id, community=request.user)
        membership.delete()
        return Response({"message": "Member removed."}, status=204)

class StudentListView(ListAPIView):
    serializer_class = StudentListSerializer
    # permission_classes = [AllowAny]  

    def get_queryset(self):
        search = self.request.GET.get("search", "")
        return User.objects.filter(role="student").filter(
            Q(username__icontains=search) | Q(email__icontains=search)
        ).order_by("username")[:20]  # limit 20 results

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
        # Fetch community account by ID from URL
        community_id = self.kwargs.get("pk")
        user = User.objects.filter(id=community_id, role="community").first()
        if not user:
            
            raise NotFound("Community not found.")
        return user


class CommunityAnalyticsView(APIView):
    """
    Optimized API to fetch analytics for the community dashboard.
    Returns engagement metrics, member activity, and activity trends.
    """
    permission_classes = [IsCommunityAccount]

    def get(self, request, pk):
        community = get_object_or_404(User, id=pk, role="community")
        now = timezone.now()
        start_date = (now - timedelta(days=6)).date()
        last_7_days = [start_date + timedelta(days=i) for i in range(7)]

        # 1. Engagement counts (Announcements, Events, Discussions)
        # Using a single query with subqueries or simple counts
        community_id = community.id
        
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

        # Merge counts into trend array
        trend_map = {date: 0 for date in last_7_days}
        for qs in [daily_posts, daily_discussions, daily_announcements, daily_events, 
                   daily_p_comments, daily_d_replies, daily_p_reactions, daily_d_reactions]:
            for entry in qs:
                trend_map[entry['created_at__date']] += entry['count']

        posts_last_7_days = [
            {"date": d.strftime("%Y-%m-%d"), "count": trend_map[d]} 
            for d in last_7_days
        ]

        # 4. Total Engagements (Sync with Trend Chart - Last 7 Days)
        total_engagements = sum(trend_map.values())

        # 5. Global Community Comparison (Top 5 + Current)
        # Aggregating base activity: Announcements + Events + Discussions
        comparison = User.objects.filter(role='community', status='active').annotate(
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

        return Response({
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
        })



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
