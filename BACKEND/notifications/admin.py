from django.contrib import admin

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'type', 'recipient', 'actor', 'is_read', 'is_deleted', 'created_at')
    list_filter = ('type', 'is_read', 'is_deleted', 'created_at')
    search_fields = ('title', 'message', 'recipient__username', 'recipient__email')
    raw_id_fields = ('recipient', 'actor')
    ordering = ('-created_at',)
