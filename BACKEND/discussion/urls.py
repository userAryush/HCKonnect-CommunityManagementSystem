from django.urls import path
from .views import *
from .thread_summary import DiscussionThreadSummaryView

urlpatterns = [

    # discussions
    path("list/", DiscussionListView.as_view()),
    path("create/", DiscussionCreateView.as_view()),
    path("discussion-detail/<uuid:pk>/", DiscussionDetailView.as_view()),
    path(
        "thread-summary/<uuid:topic_id>/",
        DiscussionThreadSummaryView.as_view(),
        name="discussion-thread-summary",
    ),
    path("<uuid:pk>/update/", DiscussionUpdateView.as_view()),
    path("<uuid:pk>/delete/", DiscussionDeleteView.as_view()),

    # replies
    path("replies/list/", ReplyListView.as_view(), name="reply-list"),
    path("replies/create/", ReplyCreateView.as_view()),
    path("replies/<uuid:pk>/update/", ReplyUpdateView.as_view()),
    path("replies/<uuid:pk>/delete/", ReplyDeleteView.as_view()),

    # reactions
    path("reactions/", ReactionCreateView.as_view()),
]
