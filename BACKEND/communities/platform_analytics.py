"""
Platform-wide analytics shared by CommunityAnalyticsView and Django admin dashboard.
"""

from django.contrib.auth import get_user_model
from django.db.models import Count, F

User = get_user_model()

# Brand-aligned chart palette (matches HCKonnect primary + accents)
CHART_BAR_COLORS = [
    "#75bf44",
    "#5fa334",
    "#8fd654",
    "#4a9e2e",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#3c3c3c",
    "#71717a",
    "#09090b",
    "#10b981",
    "#f59e0b",
]


def student_communities_queryset():
    return User.objects.filter(
        role="community",
        status="active",
        is_platform_community=False,
    )


def get_platform_overview_counts():
    return {
        "total_students": User.objects.filter(role="student", status="active").count(),
        "total_communities": student_communities_queryset().count(),
        "total_admins": User.objects.filter(role="admin").count(),
        "staff_accounts": User.objects.filter(is_staff=True).count(),
    }


def get_community_member_counts(limit=12):
    """Bar chart data: member count per student community."""
    rows = (
        student_communities_queryset()
        .annotate(member_count=Count("members", distinct=True))
        .order_by("-member_count", "community_name")[:limit]
    )
    return [
        {
            "name": c.community_name or c.username,
            "value": c.member_count,
            "color": CHART_BAR_COLORS[i % len(CHART_BAR_COLORS)],
        }
        for i, c in enumerate(rows)
    ]


def get_community_engagement_rankings(limit=10):
    """
    Horizontal leaderboard: announcements + events + discussions per community.
    Same scoring as CommunityAnalyticsView platform comparison.
    """
    rows = (
        student_communities_queryset()
        .annotate(
            a_count=Count("community_announcements", distinct=True),
            e_count=Count("events", distinct=True),
            d_count=Count("community_discussions", distinct=True),
        )
        .annotate(score=F("a_count") + F("e_count") + F("d_count"))
        .order_by("-score")[:limit]
    )
    return [
        {
            "name": c.community_name or c.username,
            "score": c.score,
            "is_current": False,
        }
        for c in rows
    ]


def scale_bars_for_chart(items, value_key="value"):
    """Add ``pct`` (0–100) for CSS bar height/width relative to max."""
    if not items:
        return []
    max_val = max((item[value_key] for item in items), default=0) or 1
    return [
        {**item, "pct": round((item[value_key] / max_val) * 100)}
        for item in items
    ]


def scale_leaderboard(items):
    """Add ``pct`` for horizontal bar width relative to top score."""
    if not items:
        return []
    max_score = max((item["score"] for item in items), default=0) or 1
    return [
        {**item, "pct": round((item["score"] / max_score) * 100)}
        for item in items
    ]
