from django.urls import path
from .views import EventListView, EventCreateView, EventUpdateView, EventDeleteView, EventRetrieveView, EventStatsView



urlpatterns = [
    path("stats/", EventStatsView.as_view(), name="event-stats"),
    path("event-list/", EventListView.as_view(), name="event-list"),
    path("event/<uuid:pk>/", EventRetrieveView.as_view(), name="event-detail"),
    path("event-create/", EventCreateView.as_view(), name="event-create"),
    path("<uuid:pk>/update/", EventUpdateView.as_view(), name="event-update"),
    path("<uuid:pk>/delete/", EventDeleteView.as_view(), name="event-delete"),
]   
