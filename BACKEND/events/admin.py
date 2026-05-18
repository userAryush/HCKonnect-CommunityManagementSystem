from django.contrib import admin

from .models import Event, EventRegistration


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'community', 'date', 'start_time', 'format', 'max_participants', 'created_at')
    list_filter = ('format', 'date', 'created_at')
    search_fields = ('title', 'description', 'location', 'community__community_name')
    raw_id_fields = ('community', 'created_by')
    date_hierarchy = 'date'
    ordering = ('-date', '-start_time')


@admin.register(EventRegistration)
class EventRegistrationAdmin(admin.ModelAdmin):
    list_display = ('event', 'user', 'attendance', 'registered_at')
    list_filter = ('attendance', 'registered_at')
    search_fields = ('event__title', 'user__username', 'user__email')
    raw_id_fields = ('event', 'user')
    ordering = ('-registered_at',)
