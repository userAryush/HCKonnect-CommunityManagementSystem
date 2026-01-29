from django.urls import path
from .views import EventListView, EventCreateView








urlpatterns = [


    path("events/", EventListView.as_view(), name="event-list"),
    path("events/create/", EventCreateView.as_view(), name="event-create"),
]
