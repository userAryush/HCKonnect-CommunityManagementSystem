from rest_framework.generics import CreateAPIView, ListAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import CommunityMembership,CommunityVacancy,Announcement,VacancyApplication
from .serializers import CommunityMembershipCreateSerializer, CommunityMemberListSerializer, CommunityListSerializer,CommunityVacancySerializer,CommunityDashboardSerializer, StudentListSerializer,AnnouncementCreateSerializer, AnnouncementReadSerializer, VacancyApplicationSerializer
from rest_framework.exceptions import NotFound, PermissionDenied
from django.contrib.auth import get_user_model
from .permissions import CanCreateCommunityContent
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from .permissions import IsCommunityAccount
User = get_user_model()


# --------------------------
# Community Vacancy Views
# --------------------------

class CreateCommunityVacancyView(CreateAPIView):
    queryset = CommunityVacancy.objects.all()
    serializer_class = CommunityVacancySerializer
    permission_classes = [IsAuthenticated, CanCreateCommunityContent]

class ListCommunityVacanciesView(ListAPIView):
    queryset = CommunityVacancy.objects.all()
    serializer_class = CommunityVacancySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "community":
            return CommunityVacancy.objects.filter(community=user)
        elif user.role == "student":
            return CommunityVacancy.objects.filter(is_open=True)
        else:
            return CommunityVacancy.objects.none()

# --------------------------
# Vacancy Application Views
# --------------------------

class ApplyVacancyView(CreateAPIView):
    serializer_class = VacancyApplicationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != "student":
            raise PermissionDenied("Only students can apply to vacancies.")
        serializer.save(user=user)

class ListVacancyApplicationsView(ListAPIView):
    serializer_class = VacancyApplicationSerializer
    permission_classes = [IsAuthenticated, CanCreateCommunityContent]

    def get_queryset(self):
        user = self.request.user
        # Only community users / representatives can view applications
        if user.role == "community":
            return VacancyApplication.objects.filter(vacancy__community=user)
        elif user.memberships.filter(role="representative").exists():
            community = user.memberships.get(role="representative").community
            return VacancyApplication.objects.filter(vacancy__community=community)
        else:
            return VacancyApplication.objects.none()


# Member Management
class ListCommunityMembersView(ListAPIView):
    serializer_class = CommunityMemberListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "community":
            return CommunityMembership.objects.filter(community=user)
        else:
            return CommunityMembership.objects.none()

class AddCommunityMemberView(CreateAPIView):
    serializer_class = CommunityMembershipCreateSerializer
    permission_classes = [IsAuthenticated,IsCommunityAccount]
    
class RemoveCommunityMemberView(APIView):
    permission_classes = [IsAuthenticated,IsCommunityAccount]
    
    def delete(self, request, membership_id):
        try:
            membership = CommunityMembership.objects.get(id=membership_id)
        except CommunityMembership.DoesNotExist:
            return Response({"error": "Membership not found"}, status=404)

        membership.delete()
        return Response({"message": "Member removed."}, status=204)


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
    permission_classes = [CanCreateCommunityContent]

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

