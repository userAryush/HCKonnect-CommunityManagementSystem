"""
Dashboard cache helpers (invalidation in services.cache.cache_invalidation).
"""
import copy
import logging
from collections.abc import Callable

from services.cache.community_page_cache import get_cached_community_page, to_json_cacheable

logger = logging.getLogger("hckonnect.cache")


def _strip_user_specific_fields(data: dict) -> dict:
    payload = copy.deepcopy(data)
    payload["is_community_owner"] = False
    return payload


def apply_dashboard_user_context(data: dict, request, community_id) -> dict:
    """Apply per-user fields after a cache hit (minimal DB for representatives only)."""
    result = copy.deepcopy(data)
    if not getattr(request.user, "is_authenticated", False):
        result["is_community_owner"] = False
        return result

    if str(request.user.id) == str(community_id):
        result["is_community_owner"] = True
        return result

    from .models import CommunityMembership

    result["is_community_owner"] = CommunityMembership.objects.filter(
        user=request.user,
        community_id=community_id,
        role="representative",
    ).exists()
    return result


def get_cached_dashboard(community_id, request, fetch_from_db: Callable[[], dict]) -> dict:
    """
    cache check → return if exists → else DB fetch → cache set → return.
    """
    community_id = str(community_id)

    def fetch_and_strip():
        return _strip_user_specific_fields(to_json_cacheable(fetch_from_db()))

    cached = get_cached_community_page(
        community_id,
        "dashboard",
        fetch_and_strip,
        log_label="dashboard",
    )
    return apply_dashboard_user_context(cached, request, community_id)
