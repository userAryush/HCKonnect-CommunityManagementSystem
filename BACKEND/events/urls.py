from django.urls import path
from .views import (
    EventListView, EventCreateView, EventUpdateView, EventDeleteView, EventRetrieveView, EventStatsView,
    EventRegistrationView, ParticipantListView, AttendanceUpdateView, ManualAddParticipantView
)

urlpatterns = [
    path("stats/", EventStatsView.as_view(), name="event-stats"),
    path("event-list/", EventListView.as_view(), name="event-list"),
    path("event/<uuid:pk>/", EventRetrieveView.as_view(), name="event-detail"),
    path("event-create/", EventCreateView.as_view(), name="event-create"),
    path("<uuid:pk>/update/", EventUpdateView.as_view(), name="event-update"),
    path("<uuid:pk>/delete/", EventDeleteView.as_view(), name="event-delete"),
    
    # New registration and management URLs
    path("<uuid:pk>/register/", EventRegistrationView.as_view(), name="event-register"),
    path("<uuid:event_id>/participants/", ParticipantListView.as_view(), name="participant-list"),
    path("registrations/<uuid:pk>/attendance/", AttendanceUpdateView.as_view(), name="attendance-update"),
    path("<uuid:event_id>/add-participant/", ManualAddParticipantView.as_view(), name="manual-add-participant"),
]   
