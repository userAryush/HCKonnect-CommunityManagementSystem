from django.contrib import admin

from .models import DiscussionPanel, DiscussionReply, Reaction


@admin.register(DiscussionPanel)
class DiscussionPanelAdmin(admin.ModelAdmin):
    list_display = ('topic', 'community', 'created_by', 'visibility', 'is_pinned', 'created_at')
    list_filter = ('visibility', 'is_pinned', 'created_at')
    search_fields = ('topic', 'content', 'created_by__username', 'community__community_name')
    raw_id_fields = ('created_by', 'community')
    ordering = ('-created_at',)


@admin.register(DiscussionReply)
class DiscussionReplyAdmin(admin.ModelAdmin):
    list_display = ('topic', 'created_by', 'parent_reply', 'created_at')
    search_fields = ('reply_content', 'created_by__username', 'topic__topic')
    raw_id_fields = ('topic', 'created_by', 'parent_reply')
    ordering = ('-created_at',)


@admin.register(Reaction)
class ReactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'topic', 'reply', 'reaction_type', 'created_at')
    list_filter = ('reaction_type',)
    raw_id_fields = ('user', 'topic', 'reply')
    ordering = ('-created_at',)
