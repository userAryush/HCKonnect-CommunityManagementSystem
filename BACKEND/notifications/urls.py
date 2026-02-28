from django.urls import path
from .views import (
    NotificationListView, 
    MarkNotificationReadView, 
    MarkAllReadView, 
    DeleteNotificationView
)

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path('<uuid:pk>/read/', MarkNotificationReadView.as_view(), name='mark-read'),
    path('mark-all-read/', MarkAllReadView.as_view(), name='mark-all-read'),
    path('<uuid:pk>/delete/', DeleteNotificationView.as_view(), name='delete-notification'),
]
