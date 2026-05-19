from django import template

register = template.Library()


def _role_label(user):
    if user.is_superuser:
        return "SuperAdmin"
    if user.is_staff:
        return "Admin"
    return "User"


def _panel_title(user):
    if user.is_superuser:
        return "SuperAdmin Panel"
    return "Admin Panel"


@register.simple_tag(takes_context=True)
def hck_admin_role_label(context):
    user = context.get("user")
    if user and user.is_authenticated:
        return _role_label(user)
    return ""


@register.simple_tag(takes_context=True)
def hck_admin_panel_title(context):
    user = context.get("user")
    if user and user.is_authenticated:
        return _panel_title(user)
    return "Admin Panel"


@register.simple_tag(takes_context=True)
def hck_navbar_user_panel_label(context):
    """e.g. SuperAdmin Panel(aryush) — shown beside the navbar user icon."""
    user = context.get("user")
    if user and user.is_authenticated:
        return f"{_panel_title(user)}({user.username})"
    return ""
