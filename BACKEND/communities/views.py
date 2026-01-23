from rest_framework.generics import CreateAPIView, ListAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import CommunityMembership,CommunityVacancy,Announcement,Event
from .serializers import (
    CommunityMembershipCreateSerializer, CommunityMemberListSerializer, CommunityListSerializer,
    MembershipApplicationSerializer, MembershipApprovalSerializer, CommunityVacancySerializer,
    CommunityDashboardSerializer, StudentListSerializer,
    AnnouncementCreateSerializer, AnnouncementReadSerializer,
    EventCreateSerializer, EventSerializer
)

from rest_framework.exceptions import NotFound
from django.contrib.auth import get_user_model
from .permissions import CanAddCommunityMembers, CanPostAnnouncement
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q


User = get_user_model()
class CreateCommunityVacancyView(CreateAPIView):
    serializer_class = CommunityVacancySerializer
    permission_classes = [AllowAny]
class ApplyMembershipView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        community = request.data.get("community")

        if not CommunityVacancy.objects.filter(
            community_id=community,
            is_open=True
        ).exists():
            return Response(
                {"error": "This community is not accepting members"},
                status=400
            )

        serializer = MembershipApplicationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({"message": "Application submitted"}, status=201)


class PendingMembershipsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user = request.user
        if user.role == "community":
            community = user
        else:  # leader
            membership = CommunityMembership.objects.filter(user=user,role="leader").first()

            if not membership:
                return Response({"error": "Not authorized"}, status=403)

            community = membership.community


        pending_memberships = CommunityMembership.objects.filter(community=community, status="pending")
        serializer = MembershipApplicationSerializer(pending_memberships, many=True)
        return Response(serializer.data)


class ApproveMembershipView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, membership_id):
        try:
            membership = CommunityMembership.objects.get(id=membership_id)
        except CommunityMembership.DoesNotExist:
            return Response(
                {"error": "Membership not found"},
                status=404
            )

        user = request.user

        # Case 1: Community account approving
        if user.role == "community":
            if membership.community != user:
                return Response(
                    {"error": "You cannot approve members for this community"},
                    status=403
                )

        # Case 2: Leader approving
        else:
            is_leader = CommunityMembership.objects.filter(
                user=user,
                community=membership.community,
                role="leader"
            ).exists()

            if not is_leader:
                return Response(
                    {"error": "Only community accounts or leaders can approve members"},
                    status=403
                )

        serializer = MembershipApprovalSerializer(
            membership,
            data=request.data,
            partial=True
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({"message": "Membership updated"}, status=200)




class AddCommunityMemberView(CreateAPIView):
    serializer_class = CommunityMembershipCreateSerializer
    permission_classes = [AllowAny]
    
class RemoveCommunityMemberView(APIView):
    permission_classes = [AllowAny]

    def delete(self, request, membership_id):
        try:
            membership = CommunityMembership.objects.get(id=membership_id)
        except CommunityMembership.DoesNotExist:
            return Response({"error": "Membership not found"}, status=404)

        user = request.user

        # Permission: only community account or leader in that community
        if user.role != "community" and not CommunityMembership.objects.filter(
            user=user, community=membership.community, role="leader"
        ).exists():
            return Response({"error": "Not allowed to remove members."}, status=403)

        membership.delete()
        return Response({"message": "Member removed."}, status=204)

class CommunityMemberListView(ListAPIView):
    serializer_class = CommunityMemberListSerializer
    permission_classes = [AllowAny]  # any logged-in user can see

    def get_queryset(self):
        # Only list members of the requested community
        community_id = self.kwargs.get("community_id")  # pass community id via URL
        return CommunityMembership.objects.filter(
            community_id=community_id
        ).select_related("user")

class CommunityListView(ListAPIView):
    serializer_class = CommunityListSerializer
    permission_classes =[AllowAny]

    def get_queryset(self):
        return User.objects.filter(
            role="community",
            status="active"
        ).order_by("community_name")

class CommunityDashboardView(RetrieveAPIView):
    """
    API to fetch community dashboard data.
    Only accessible to users with role='community'.
    """
    serializer_class = CommunityDashboardSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        # Fetch community account by ID from URL
        community_id = self.kwargs.get("pk")
        user = User.objects.filter(id=community_id, role="community").first()
        if not user:
            
            raise NotFound("Community not found.")
        return user

class StudentListView(ListAPIView):
    serializer_class = StudentListSerializer
    permission_classes = [AllowAny]  # remove auth temporarily

    def get_queryset(self):
        search = self.request.GET.get("search", "")
        return User.objects.filter(role="student").filter(
            Q(username__icontains=search) | Q(email__icontains=search)
        ).order_by("username")[:20]  # limit 20 results

class AnnouncementCreateView(CreateAPIView):
    serializer_class = AnnouncementCreateSerializer
    permission_classes = [CanPostAnnouncement]

class AnnouncementListView(ListAPIView):
    serializer_class = AnnouncementReadSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user = self.request.user
        qs = Announcement.objects.all()

        # Build Q objects for visibility
        public_q = Q(visibility="public")
        
        community_q = Q(pk__in=[])
        all_members_q = Q(pk__in=[])

        if user.is_authenticated:
            # 1. All Members visibility
            if user.role == "community" or CommunityMembership.objects.filter(user=user).exists():
                all_members_q = Q(visibility="all_members")
            
            # 2. My Community visibility
            if user.role == "community":
                 community_q = Q(visibility="community", community=user)
            elif user.role == "student":
                 my_community_ids = CommunityMembership.objects.filter(user=user).values_list('community_id', flat=True)
                 community_q = Q(visibility="community", community_id__in=my_community_ids)
        
        return qs.filter(public_q | all_members_q | community_q).distinct()
