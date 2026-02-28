from django.db import models
from django.conf import settings
from Base.models import BaseModel

class Notification(BaseModel):
    NOTIFICATION_TYPES = [
        ('membership', 'Membership'),
        ('role_change', 'Role Change'),
        ('vacancy', 'Vacancy/Recruitment'),
        ('event', 'Event'),
        ('announcement', 'Announcement'),
        ('discussion', 'Discussion'),
        ('post', 'Post'),
        ('resource', 'Resource'),
    ]

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='actions'
    )
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    metadata = models.JSONField(default=dict, blank=True) # For links, IDs, etc.
    is_read = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False) # Soft delete

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.type} - {self.recipient.username} - {self.title}"
