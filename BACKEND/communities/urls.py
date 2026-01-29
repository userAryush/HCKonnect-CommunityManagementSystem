from django.urls import path
from .views import CommunityListView, CreateCommunityVacancyView, ApplyVacancyView,AddCommunityMemberView, CommunityDashboardView,RemoveCommunityMemberView, StudentListView,AnnouncementCreateView, AnnouncementListView, ListCommunityMembersView, ListCommunityVacanciesView, ListVacancyApplicationsView







urlpatterns = [

    path("communities-list/",CommunityListView.as_view(),name="community-list"),
    path('dashboard/<uuid:pk>/', CommunityDashboardView.as_view(), name='community-dashboard'),
    
     # Vacancies
    path('vacancies/', ListCommunityVacanciesView.as_view(), name='vacancy-list'),
    path('vacancies/create/', CreateCommunityVacancyView.as_view(), name='vacancy-create'),

    # Vacancy applications
    path('vacancies/apply/', ApplyVacancyView.as_view(), name='vacancy-apply'),
    path('vacancies/applications/', ListVacancyApplicationsView.as_view(), name='vacancy-applications'),

    # Community members
    path('members/', ListCommunityMembersView.as_view(), name='member-list'),
    path('members/add/', AddCommunityMemberView.as_view(), name='member-add'),
    path('members/remove/<int:membership_id>/', RemoveCommunityMemberView.as_view(), name='member-remove'),
    
    path("students/", StudentListView.as_view(), name="students-list"),

    path("announcements/", AnnouncementListView.as_view(), name="announcement-list"),
    path("announcements/create/", AnnouncementCreateView.as_view(), name="announcement-create"),

]
