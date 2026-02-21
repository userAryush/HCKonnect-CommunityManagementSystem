from django.urls import path
from .views import AnnouncementCreateView, AnnouncementListView, AnnouncementUpdateView, AnnouncementDeleteView, AnnouncementStatsView, PostCreateView, PostListView, PostDetailView, PostUpdateDeleteView, PostReactionToggleView, PostCommentCreateView, PostCommentUpdateView, PostCommentDeleteView, PostCommentListView, ResourceCreateView, ResourceListView, ResourceUpdateDeleteView




urlpatterns = [

    path("announcements/stats/", AnnouncementStatsView.as_view(), name="announcement-stats"),
    path("announcements/", AnnouncementListView.as_view(), name="announcement-list"),
    path("announcements/create/", AnnouncementCreateView.as_view(), name="announcement-create"),
    path("announcements/<uuid:pk>/update/", AnnouncementUpdateView.as_view(), name="announcement-update"),
    path("announcements/<uuid:pk>/delete/", AnnouncementDeleteView.as_view(), name="announcement-delete"),
    # Posts
    path("post-list/", PostListView.as_view(), name="post-list"),
    path("post/create/", PostCreateView.as_view(), name="post-create"),
    path("post/detail/<uuid:pk>/", PostDetailView.as_view(), name="post-detail"),
    path("post/<uuid:pk>/manage/", PostUpdateDeleteView.as_view(), name="post-manage"),
    path("post/react/", PostReactionToggleView.as_view(), name="post-react"), # Removed <pk> since serializer handles post/comment id

    # Post Comments (NEW)
    path("post/comments/create/", PostCommentCreateView.as_view(), name="comment-create"),
    path("post/comments/list/", PostCommentListView.as_view(), name="comment-list"),
    path("post/comments/<uuid:pk>/update/", PostCommentUpdateView.as_view(), name="comment-update"),
    path("post/comments/<uuid:pk>/delete/", PostCommentDeleteView.as_view(), name="comment-delete"),


    # Resources
    path("resources/", ResourceListView.as_view(), name="resource-list"),
    path("resources/create/", ResourceCreateView.as_view(), name="resource-create"),
    path("resources/<uuid:pk>/manage/", ResourceUpdateDeleteView.as_view(), name="resource-manage"),

]
