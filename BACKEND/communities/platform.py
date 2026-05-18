"""Helpers for Herald DevCorps and other platform-level communities."""

from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model

User = get_user_model()


def is_platform_community(user):
    """Return True if user is a platform-level community account."""
    return bool(
        user
        and getattr(user, "role", None) == "community"
        and getattr(user, "is_platform_community", False)
    )


def get_platform_community():
    """Return the single platform community, or None."""
    return User.objects.filter(role="community", is_platform_community=True).first()


def validate_single_platform_community(user):
    """
    Enforce at most one platform community in the system.
    Call from User.clean(), admin forms, and serializers.
    """
    if not getattr(user, "is_platform_community", False):
        return

    if user.role != "community":
        raise ValidationError(
            {"is_platform_community": "Only community accounts can be marked as platform communities."}
        )

    qs = User.objects.filter(role="community", is_platform_community=True)
    if user.pk:
        qs = qs.exclude(pk=user.pk)
    if qs.exists():
        existing = qs.first()
        name = existing.community_name or existing.username
        raise ValidationError(
            {
                "is_platform_community": (
                    f"A platform community already exists ({name}). "
                    "Only one platform community is allowed."
                )
            }
        )


def enforce_public_visibility(community, visibility):
    """Platform communities may only publish public content."""
    if is_platform_community(community) and visibility == "private":
        raise ValidationError(
            {"visibility": "Platform communities cannot create private content."}
        )


def get_content_community(user):
    """Resolve the community account for content creation."""
    if user.role == "community":
        return user
    membership = getattr(user, "membership", None)
    if membership and membership.role == "representative":
        return membership.community
    return None
