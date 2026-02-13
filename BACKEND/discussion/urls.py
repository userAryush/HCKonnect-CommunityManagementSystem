from django.urls import path
from .views import *

urlpatterns = [

    # discussions
    path("list/", DiscussionListView.as_view()),
    path("create/", DiscussionCreateView.as_view()),
    path("discussion-detail/<uuid:pk>/", DiscussionDetailView.as_view()),
    path("<uuid:pk>/update/", DiscussionUpdateView.as_view()),
    path("<uuid:pk>/delete/", DiscussionDeleteView.as_view()),

    # replies
    path("replies/create/", ReplyCreateView.as_view()),
    path("replies/<uuid:pk>/update/", ReplyUpdateView.as_view()),
    path("replies/<uuid:pk>/delete/", ReplyDeleteView.as_view()),

    # reactions
    path("reactions/", ReactionCreateView.as_view()),
]
