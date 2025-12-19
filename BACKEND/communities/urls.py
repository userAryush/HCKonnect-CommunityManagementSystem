from django.urls import path
from django.urls import path
from .views import AddCommunityMemberView,CommunityMemberListView,CommunityListView





urlpatterns = [
    path("members/add/", AddCommunityMemberView.as_view()),
    path("members/", CommunityMemberListView.as_view()),
    path("communities/", CommunityListView.as_view(), name="community-list")
]