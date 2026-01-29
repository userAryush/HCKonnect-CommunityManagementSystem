from rest_framework.generics import CreateAPIView, ListAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import CommunityMembership,CommunityVacancy,VacancyApplication
from .serializers import CommunityMembershipCreateSerializer, CommunityMemberListSerializer, CommunityListSerializer,CommunityVacancySerializer,CommunityDashboardSerializer, StudentListSerializer,VacancyApplicationSerializer
from rest_framework.exceptions import NotFound, PermissionDenied
from django.contrib.auth import get_user_model
from contents.permissions import CanCreateCommunityContent
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from .permissions import IsCommunityAccount
from django.shortcuts import get_object_or_404

User = get_user_model()


# --------------------------
# Community Vacancy Views
# --------------------------

class CreateCommunityVacancyView(CreateAPIView):
    queryset = CommunityVacancy.objects.all()
    serializer_class = CommunityVacancySerializer
    permission_classes = [IsAuthenticated, CanCreateCommunityContent]

class ListCommunityVacanciesView(ListAPIView):
    serializer_class = CommunityVacancySerializer
    permission_classes = [IsAuthenticated]

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
        vacancy_id = self.request.query_params.get('vacancy_id')
        
        # Determine which community's data to look at
        if user.role == "community":
            target_community = user
        elif user.memberships.filter(role="representative").exists():
            target_community = user.memberships.get(role="representative").community
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
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated,IsCommunityAccount]
    
class RemoveCommunityMemberView(APIView):
    permission_classes = [IsAuthenticated, IsCommunityAccount]
    
    def delete(self, request, membership_id):
        # We don't just search by 'id=membership_id'. 
        # We also filter by 'community=request.user'.
        # This prevents Community A from deleting a member from Community B by guessing their ID.
        membership = get_object_or_404(CommunityMembership, id=membership_id, community=request.user)
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
    permission_classes = [AllowAny]  

    def get_queryset(self):
        search = self.request.GET.get("search", "")
        return User.objects.filter(role="student").filter(
            Q(username__icontains=search) | Q(email__icontains=search)
        ).order_by("username")[:20]  # limit 20 results


