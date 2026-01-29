from django.urls import path
from .views import AnnouncementCreateView, AnnouncementListView

urlpatterns = [

    path("announcements/", AnnouncementListView.as_view(), name="announcement-list"),
    path("announcements/create/", AnnouncementCreateView.as_view(), name="announcement-create"),

]
