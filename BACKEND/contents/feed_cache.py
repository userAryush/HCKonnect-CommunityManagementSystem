"""
Feed cache read helpers (invalidation lives in services.cache.cache_invalidation).
"""
import copy

from django.conf import settings

from services.cache import get_or_set_cache
from services.cache.cache_keys import feed_key
from services.cache.cache_trace import format_query_context

FEED_CACHE_TIMEOUT = getattr(settings, "FEED_CACHE_TIMEOUT", 45)


def _feed_log_context(community_id, request=None) -> str:
    params = {"community_id": community_id}
    if request is not None:
        qp = request.query_params
        params["type"] = qp.get("type", "all")
        params["page"] = qp.get("page", "1")
        params["page_size"] = qp.get("page_size", "20")
    return format_query_context(**params)


def get_cached_community_feed(community_id, build_feed_items, request=None):
    """
    Return stripped feed items for a community, using Redis when possible.

    Redis key: feed_{community_id} (see cache_keys.feed_key).
    """
    return get_or_set_cache(
        feed_key(community_id),
        FEED_CACHE_TIMEOUT,
        lambda: strip_user_specific_feed_fields(build_feed_items()),
        log_label="community_feed",
        log_context=_feed_log_context(community_id, request),
    )


def strip_user_specific_feed_fields(items: list) -> list:
    """Remove per-user fields before storing a shared community feed in cache."""
    cached = copy.deepcopy(items)
    for item in cached:
        if item.get("type") == "post":
            item["user_has_liked"] = False
    return cached


def apply_user_likes_to_feed(items: list, user) -> list:
    """Re-apply like state on cache hit without busting the shared cache key."""
    from .models import PostReaction

    result = copy.deepcopy(items)
    if not getattr(user, "is_authenticated", False):
        return result

    post_ids = [item["id"] for item in result if item.get("type") == "post" and item.get("id")]
    if not post_ids:
        return result

    liked_ids = set(
        PostReaction.objects.filter(
            user=user,
            post_id__in=post_ids,
            comment__isnull=True,
        ).values_list("post_id", flat=True)
    )
    liked_str = {str(pk) for pk in liked_ids}

    for item in result:
        if item.get("type") == "post":
            item["user_has_liked"] = str(item.get("id")) in liked_str
    return result
