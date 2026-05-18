from django.contrib import admin

from .models import CommunityMembership, CommunityVacancy, VacancyApplication


@admin.register(CommunityMembership)
class CommunityMembershipAdmin(admin.ModelAdmin):
    list_display = ('user', 'community', 'role', 'created_at')
    list_filter = ('role', 'created_at')
    search_fields = ('user__username', 'user__email', 'community__community_name')
    raw_id_fields = ('user', 'community')
    ordering = ('-created_at',)


@admin.register(CommunityVacancy)
class CommunityVacancyAdmin(admin.ModelAdmin):
    list_display = ('title', 'community', 'status', 'is_open', 'deadline', 'created_at')
    list_filter = ('status', 'is_open', 'created_at')
    search_fields = ('title', 'community__community_name')
    raw_id_fields = ('community',)
    ordering = ('-created_at',)


@admin.register(VacancyApplication)
class VacancyApplicationAdmin(admin.ModelAdmin):
    list_display = ('user', 'vacancy', 'applied_at')
    search_fields = ('user__username', 'user__email', 'vacancy__title')
    raw_id_fields = ('user', 'vacancy')
    ordering = ('-applied_at',)
