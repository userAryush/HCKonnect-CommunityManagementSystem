from django.contrib import admin

from .models import Announcement, Post, PostComment, PostReaction, Resource


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('title', 'community', 'visibility', 'created_by_user', 'created_at')
    list_filter = ('visibility', 'created_at')
    search_fields = ('title', 'description', 'community__community_name')
    raw_id_fields = ('community', 'created_by_user')
    ordering = ('-created_at',)


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('author', 'content_preview', 'is_pinned', 'created_at')
    list_filter = ('is_pinned', 'created_at')
    search_fields = ('content', 'author__username', 'author__email')
    raw_id_fields = ('author',)
    ordering = ('-created_at',)

    @admin.display(description='Content')
    def content_preview(self, obj):
        text = (obj.content or '').strip()
        return text[:80] + ('…' if len(text) > 80 else '')


@admin.register(PostComment)
class PostCommentAdmin(admin.ModelAdmin):
    list_display = ('post', 'author', 'parent_comment', 'created_at')
    search_fields = ('content', 'author__username')
    raw_id_fields = ('post', 'author', 'parent_comment')
    ordering = ('-created_at',)


@admin.register(PostReaction)
class PostReactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'post', 'comment', 'reaction_type', 'created_at')
    list_filter = ('reaction_type',)
    raw_id_fields = ('user', 'post', 'comment')
    ordering = ('-created_at',)


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ('title', 'community', 'category', 'visibility', 'created_at')
    list_filter = ('category', 'visibility', 'created_at')
    search_fields = ('title', 'description', 'community__community_name')
    raw_id_fields = ('community', 'created_by_user')
    ordering = ('-created_at',)
