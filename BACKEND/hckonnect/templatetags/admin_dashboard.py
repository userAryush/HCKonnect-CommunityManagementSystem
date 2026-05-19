from django import template

from hckonnect.admin_dashboard import get_dashboard_context

register = template.Library()


@register.inclusion_tag("admin/includes/dashboard_panel.html", takes_context=True)
def hckonnect_dashboard_stats(context):
    data = get_dashboard_context()
    return {
        "request": context.get("request"),
        "dashboard_stats": data["dashboard_stats"],
        "member_counts": data["member_counts"],
        "engagement_rankings": data["engagement_rankings"],
        "recent_admin_logs": data["recent_admin_logs"],
        "user": context.get("user"),
    }
