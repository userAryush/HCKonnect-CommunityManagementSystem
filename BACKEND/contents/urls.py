from django.urls import path
from .views import AnnouncementCreateView, AnnouncementListView, AnnouncementUpdateView, AnnouncementDeleteView, AnnouncementStatsView


urlpatterns = [

    path("announcements/stats/", AnnouncementStatsView.as_view(), name="announcement-stats"),
    path("announcements/", AnnouncementListView.as_view(), name="announcement-list"),
    path("announcements/create/", AnnouncementCreateView.as_view(), name="announcement-create"),
    path("announcements/<uuid:pk>/update/", AnnouncementUpdateView.as_view(), name="announcement-update"),
    path("announcements/<uuid:pk>/delete/", AnnouncementDeleteView.as_view(), name="announcement-delete"),


]
