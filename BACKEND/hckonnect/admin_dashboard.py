"""Dashboard stats, charts, and recent admin activity for the custom index page."""

from datetime import timedelta

from django.contrib.admin.models import LogEntry
from django.utils import timezone

from accounts.models import User
from communities.models import CommunityMembership, CommunityVacancy
from communities.platform_analytics import (
    get_community_engagement_rankings,
    get_community_member_counts,
    get_platform_overview_counts,
    scale_bars_for_chart,
    scale_leaderboard,
)
from contents.models import Announcement, Post
from discussion.models import DiscussionPanel
from events.models import Event


def get_dashboard_context():
    now = timezone.now()
    week_ago = now - timedelta(days=7)

    recent_logs = (
        LogEntry.objects.select_related("user", "content_type")
        .order_by("-action_time")[:12]
    )
    activity_7d = LogEntry.objects.filter(action_time__gte=week_ago).count()
    platform = get_platform_overview_counts()

    member_counts = scale_bars_for_chart(get_community_member_counts(limit=12))
    engagement_rankings = scale_leaderboard(get_community_engagement_rankings(limit=10))

    return {
        "dashboard_stats": [
            {
                "label": "Total users",
                "value": User.objects.count(),
                "icon": "fas fa-users",
                "tone": "green",
            },
            {
                "label": "Students",
                "value": platform["total_students"],
                "icon": "fas fa-user-graduate",
                "tone": "slate",
            },
            {
                "label": "Communities",
                "value": platform["total_communities"],
                "icon": "fas fa-university",
                "tone": "green",
            },
            {
                "label": "Platform admins",
                "value": platform["total_admins"],
                "icon": "fas fa-user-shield",
                "tone": "slate",
            },
            {
                "label": "Staff accounts",
                "value": platform["staff_accounts"],
                "icon": "fas fa-id-badge",
                "tone": "green",
            },
            {
                "label": "Memberships",
                "value": CommunityMembership.objects.count(),
                "icon": "fas fa-user-friends",
                "tone": "slate",
            },
            {
                "label": "Announcements",
                "value": Announcement.objects.count(),
                "icon": "fas fa-bullhorn",
                "tone": "green",
            },
            {
                "label": "Discussions",
                "value": DiscussionPanel.objects.count(),
                "icon": "fas fa-comments",
                "tone": "slate",
            },
            {
                "label": "Events",
                "value": Event.objects.count(),
                "icon": "fas fa-calendar-alt",
                "tone": "green",
            },
            {
                "label": "Feed posts",
                "value": Post.objects.count(),
                "icon": "fas fa-stream",
                "tone": "slate",
            },
            {
                "label": "Open vacancies",
                "value": CommunityVacancy.objects.filter(is_open=True).count(),
                "icon": "fas fa-briefcase",
                "tone": "green",
            },
            {
                "label": "Admin actions (7d)",
                "value": activity_7d,
                "icon": "fas fa-history",
                "tone": "slate",
            },
        ],
        "member_counts": member_counts,
        "engagement_rankings": engagement_rankings,
        "recent_admin_logs": recent_logs,
    }
