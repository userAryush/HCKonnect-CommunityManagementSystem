from django.urls import path
from .views import CommunityListView, CreateCommunityVacancyView, ApplyVacancyView,AddCommunityMemberView, CommunityDashboardView,RemoveCommunityMemberView, StudentListView, ListCommunityMembersView, ListCommunityVacanciesView, ListVacancyApplicationsView







urlpatterns = [

    path("communities-list/",CommunityListView.as_view(),name="community-list"),
    path('dashboard/<uuid:pk>/', CommunityDashboardView.as_view(), name='community-dashboard'),
    
    # 1. Global & Specific Browsing
    #  use this to see ALL open vacancies: /../vacancies/
    #  use this to see ONE community: /../vacancies/?community_id=5
    path('vacancies/', ListCommunityVacanciesView.as_view(), name='vacancy-list'),

    # 2. Creation
    # Only Community/Reps can hit this: /../vacancies/create/
    path('vacancies/create/', CreateCommunityVacancyView.as_view(), name='vacancy-create'),

    
    # 3. Applying
    # Unaffiliated students hit this to apply: /../vacancies/apply/
    # (The vacancy ID is sent in the request body)
    path('vacancies/apply/', ApplyVacancyView.as_view(), name='vacancy-apply'),

    # 4. Management / Review
    # Community/Reps use this to see ALL their applicants: /../vacancies/applications/
    # Community/Reps filter for ONE vacancy: /../vacancies/applications/?vacancy_id=10
    path('vacancies/applications/', ListVacancyApplicationsView.as_view(), name='vacancy-applications'),

    # Community members
    
    # Used by Community Accounts to see their own members.
    path('members/', ListCommunityMembersView.as_view(), name='member-list'),

    # Add a Member
    path('members/add/', AddCommunityMemberView.as_view(), name='member-add'),

    # Remove/Kick a Member
    # URL: /members/remove/15/
    path('members/remove/<int:membership_id>/', RemoveCommunityMemberView.as_view(), name='member-remove'),

    # Allows students/admins to see who belongs to a specific community.
    # Logic: The view grabs 'community_id' from the URL path.
    # URL: /5/members/ (where 5 is the Community User ID)
    path('<int:community_id>/members/', ListCommunityMembersView.as_view(), name='community-members'),
    
    path("students/", StudentListView.as_view(), name="students-list")


]
