from django.urls import path
from .views import (
    CommunityListView, CreateCommunityVacancyView, ApplyMembershipView, PendingMembershipsView,
    ApproveMembershipView, AddCommunityMemberView, CommunityMemberListView, CommunityDashboardView,
    RemoveCommunityMemberView, StudentListView,
    AnnouncementCreateView, AnnouncementListView
)





urlpatterns = [
    # -----------------------------
    # Communities
    # -----------------------------
    path("communities-list/",CommunityListView.as_view(),name="community-list"),
    path('dashboard/<uuid:pk>/', CommunityDashboardView.as_view(), name='community-dashboard'),
    # -----------------------------
    # Vacancy (open / close recruitment)
    # -----------------------------
    path("community-vacancy/",CreateCommunityVacancyView.as_view(),name="community-vacancy"),

    # -----------------------------
    # Membership application (student)
    # -----------------------------
    path("memberships/apply/",ApplyMembershipView.as_view(),name="membership-apply"),

    # -----------------------------
    # Pending applications (community / leader)
    # -----------------------------
    path("memberships/pending/",PendingMembershipsView.as_view(),name="membership-pending"),

    path("memberships/<int:membership_id>/approve/",ApproveMembershipView.as_view(),name="membership-approve"),

    # -----------------------------
    # Direct member management
    # -----------------------------
    path("members/add/",AddCommunityMemberView.as_view(),name="member-add"),
    
    # -----------------------------
    # Remove member
    # -----------------------------
    path("members/<int:membership_id>/", RemoveCommunityMemberView.as_view(), name="member-remove"),


    path("<uuid:community_id>/members/",CommunityMemberListView.as_view(),name="community-members"),
    
    # urls.py
    path("students/", StudentListView.as_view(), name="students-list"),

    # -----------------------------
    # Announcements & Events
    # -----------------------------
    path("announcements/", AnnouncementListView.as_view(), name="announcement-list"),
    path("announcements/create/", AnnouncementCreateView.as_view(), name="announcement-create"),

]
