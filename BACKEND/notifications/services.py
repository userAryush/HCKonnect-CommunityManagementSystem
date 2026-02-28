from .models import Notification
from django.contrib.auth import get_user_model

User = get_user_model()

class NotificationService:
    @staticmethod
    def create_notification(recipient, type, title, message, actor=None, metadata=None):
        return Notification.objects.create(
            recipient=recipient,
            type=type,
            title=title,
            message=message,
            actor=actor,
            metadata=metadata or {}
        )

    @staticmethod
    def notify_group(users, type, title, message, actor=None, metadata=None):
        notifications = [
            Notification(
                recipient=user,
                type=type,
                title=title,
                message=message,
                actor=actor,
                metadata=metadata or {}
            ) for user in users
        ]
        return Notification.objects.bulk_create(notifications)
