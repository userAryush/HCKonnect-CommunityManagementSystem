from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe

from hckonnect.admin_mixins import ExportCsvMixin

from .models import Announcement, Post, PostComment, PostReaction, Resource


@admin.register(Announcement)
class AnnouncementAdmin(ExportCsvMixin, admin.ModelAdmin):
    list_display = (
        "title",
        "community",
        "visibility_badge",
        "created_by_user",
        "image_thumb",
        "created_at",
    )
    list_filter = ("visibility", "created_at")
    search_fields = ("title", "description", "community__community_name")
    raw_id_fields = ("community", "created_by_user")
    ordering = ("-created_at",)
    actions = ["export_selected_as_csv"]

    fieldsets = (
        ("Announcement", {"fields": ("title", "description", "image")}),
        (
            "Publishing",
            {
                "classes": ("collapse",),
                "fields": ("community", "created_by_user", "visibility"),
            },
        ),
    )

    @admin.display(description="Visibility")
    def visibility_badge(self, obj):
        if obj.visibility == "public":
            return mark_safe(
                '<span style="background:#dcfce7;color:#166534;padding:2px 8px;'
                'border-radius:6px;font-size:12px;font-weight:600;">Public</span>'
            )
        return mark_safe(
            '<span style="background:#fef9c3;color:#854d0e;padding:2px 8px;'
            'border-radius:6px;font-size:12px;font-weight:600;">Private</span>'
        )

    @admin.display(description="Image")
    def image_thumb(self, obj):
        if not obj.image:
            return "—"
        return format_html(
            '<img src="{}" width="40" height="40" style="object-fit:cover;'
            'border-radius:6px;" alt="">',
            obj.image.url,
        )


@admin.register(Post)
class PostAdmin(ExportCsvMixin, admin.ModelAdmin):
    list_display = (
        "author",
        "content_preview",
        "image_thumb",
        "is_pinned",
        "created_at",
    )
    list_filter = ("is_pinned", "created_at")
    search_fields = ("content", "author__username", "author__email")
    raw_id_fields = ("author",)
    ordering = ("-created_at",)
    actions = ["export_selected_as_csv"]

    @admin.display(description="Content")
    def content_preview(self, obj):
        text = (obj.content or "").strip()
        return text[:80] + ("…" if len(text) > 80 else "")

    @admin.display(description="Image")
    def image_thumb(self, obj):
        if not obj.image:
            return "—"
        return format_html(
            '<img src="{}" width="40" height="40" style="object-fit:cover;'
            'border-radius:6px;" alt="">',
            obj.image.url,
        )


@admin.register(PostComment)
class PostCommentAdmin(admin.ModelAdmin):
    list_display = ("post", "author", "parent_comment", "created_at")
    search_fields = ("content", "author__username")
    raw_id_fields = ("post", "author", "parent_comment")
    ordering = ("-created_at",)


@admin.register(PostReaction)
class PostReactionAdmin(admin.ModelAdmin):
    list_display = ("user", "post", "comment", "reaction_type", "created_at")
    list_filter = ("reaction_type",)
    raw_id_fields = ("user", "post", "comment")
    ordering = ("-created_at",)


@admin.register(Resource)
class ResourceAdmin(ExportCsvMixin, admin.ModelAdmin):
    list_display = ("title", "community", "category", "visibility", "created_at")
    list_filter = ("category", "visibility", "created_at")
    search_fields = ("title", "description", "community__community_name")
    raw_id_fields = ("community", "created_by_user")
    ordering = ("-created_at",)
    actions = ["export_selected_as_csv"]
