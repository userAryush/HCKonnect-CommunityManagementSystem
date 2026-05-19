from django import forms
from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from tinymce.widgets import TinyMCE

from hckonnect.admin_mixins import ExportCsvMixin, OwnerRestrictedAdminMixin

from .models import DiscussionPanel, DiscussionReply, Reaction


class DiscussionPanelAdminForm(forms.ModelForm):
    class Meta:
        model = DiscussionPanel
        fields = "__all__"
        widgets = {
            "content": TinyMCE(
                attrs={"cols": 80, "rows": 25},
            ),
        }


@admin.register(DiscussionPanel)
class DiscussionPanelAdmin(ExportCsvMixin, OwnerRestrictedAdminMixin, admin.ModelAdmin):
    form = DiscussionPanelAdminForm
    owner_field = "created_by"

    list_display = (
        "topic",
        "community",
        "created_by",
        "visibility_badge",
        "pinned_badge",
        "reply_count",
        "created_at",
    )
    list_filter = ("visibility", "is_pinned", "created_at")
    search_fields = (
        "topic",
        "content",
        "created_by__username",
        "community__community_name",
    )
    raw_id_fields = ("created_by", "community")
    ordering = ("-created_at",)
    actions = ["export_selected_as_csv"]

    fieldsets = (
        (
            "Topic",
            {
                "fields": ("topic", "content"),
                "description": "Main discussion title and body (rich text).",
            },
        ),
        (
            "Audience & placement",
            {
                "classes": ("collapse",),
                "fields": ("community", "visibility", "is_pinned"),
            },
        ),
        (
            "Ownership",
            {
                "classes": ("collapse",),
                "fields": ("created_by",),
            },
        ),
    )

    @admin.display(description="Visibility")
    def visibility_badge(self, obj):
        colors = {
            "public": ("#dcfce7", "#166534", "Public"),
            "private": ("#fef9c3", "#854d0e", "Private"),
        }
        bg, fg, label = colors.get(
            obj.visibility, ("#f4f4f5", "#3f3f46", obj.visibility)
        )
        return mark_safe(
            f'<span style="background:{bg};color:{fg};padding:2px 8px;'
            f'border-radius:6px;font-size:12px;font-weight:600;">{label}</span>'
        )

    @admin.display(description="Pinned")
    def pinned_badge(self, obj):
        if obj.is_pinned:
            return mark_safe(
                '<span style="background:#75bf44;color:#09090b;padding:2px 8px;'
                'border-radius:6px;font-size:12px;font-weight:600;">Pinned</span>'
            )
        return mark_safe(
            '<span style="color:#71717a;font-size:12px;">—</span>'
        )

    @admin.display(description="Replies")
    def reply_count(self, obj):
        return obj.replies.count()


@admin.register(DiscussionReply)
class DiscussionReplyAdmin(ExportCsvMixin, OwnerRestrictedAdminMixin, admin.ModelAdmin):
    owner_field = "created_by"

    list_display = ("topic", "created_by", "parent_reply", "content_preview", "created_at")
    search_fields = ("reply_content", "created_by__username", "topic__topic")
    raw_id_fields = ("topic", "created_by", "parent_reply")
    ordering = ("-created_at",)
    actions = ["export_selected_as_csv"]

    fieldsets = (
        ("Reply", {"fields": ("topic", "reply_content", "parent_reply")}),
        (
            "Meta",
            {"classes": ("collapse",), "fields": ("created_by",)},
        ),
    )

    @admin.display(description="Content")
    def content_preview(self, obj):
        text = (obj.reply_content or "").strip()
        return text[:60] + ("…" if len(text) > 60 else "")


@admin.register(Reaction)
class ReactionAdmin(ExportCsvMixin, admin.ModelAdmin):
    list_display = ("user", "topic", "reply", "reaction_type", "created_at")
    list_filter = ("reaction_type",)
    raw_id_fields = ("user", "topic", "reply")
    ordering = ("-created_at",)
    actions = ["export_selected_as_csv"]
