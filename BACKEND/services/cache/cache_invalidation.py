"""
Centralized Redis cache invalidation for HCKonnect.
"""
from django.core.cache import cache

from .cache_keys import (
    community_key,
    community_page_version_key,
    discussion_detail_key,
    discussion_replies_key,
    feed_key,
    post_key,
    vacancy_key,
)


def _get_redis_client():
    return cache._cache.get_client(write=True)


def _scan_and_delete(client, match: str) -> int:
    deleted = 0
    cursor = 0
    while True:
        cursor, keys = client.scan(cursor=cursor, match=match, count=100)
        if keys:
            client.delete(*keys)
            deleted += len(keys)
        if cursor == 0:
            break
    return deleted


def delete_cache_keys_with_prefix(logical_prefix: str) -> int:
    """Delete all cache entries whose logical key starts with ``logical_prefix``."""
    if not logical_prefix:
        return 0
    client = _get_redis_client()
    match = cache.make_key(logical_prefix) + "*"
    return _scan_and_delete(client, match)


def delete_cache_pattern(logical_pattern: str) -> int:
    """
    Safe wildcard deletion for logical cache key patterns (uses Redis SCAN).

    Supports suffix wildcards (e.g. ``feed_*``, ``dashboard_*``).
    For keys that use colons (``dashboard:{id}:...``), ``dashboard_*`` also
    scans the ``dashboard:`` prefix.
    """
    if not logical_pattern:
        return 0

    if "*" not in logical_pattern:
        cache.delete(logical_pattern)
        return 1

    if logical_pattern.count("*") == 1:
        before, after = logical_pattern.split("*", 1)
        client = _get_redis_client()
        redis_pattern = cache.make_key(before) + "*" + after
        deleted = _scan_and_delete(client, redis_pattern)
        if before == "dashboard_" or logical_pattern == "dashboard_*":
            deleted += delete_cache_keys_with_prefix("dashboard:")
        return deleted

    return delete_cache_keys_with_prefix(logical_pattern.replace("*", ""))


def community_id_for_user(user):
    """Resolve the community affected by a user's content or membership action."""
    if not user or not getattr(user, "is_authenticated", False):
        return None
    if getattr(user, "role", None) == "community":
        return user.id
    membership = getattr(user, "membership", None)
    if membership:
        return membership.community_id
    return None


def invalidate_user_feed_cache() -> None:
    """Invalidate global user feed summary caches (timeline, sidebar, profile)."""
    delete_cache_pattern("user_feed_*")


def invalidate_feed_cache(community_id=None) -> None:
    invalidate_user_feed_cache()
    if community_id:
        cache.delete(feed_key(community_id))
    else:
        delete_cache_pattern("feed_*")


def invalidate_community_page_caches(community_id=None) -> None:
    """
    Invalidate dashboard, analytics, events, announcements, vacancies, and related
  community page caches by bumping the shared version for that community.
    """
    if community_id:
        cid = str(community_id)
        version_key = community_page_version_key(cid)
        try:
            cache.incr(version_key)
        except ValueError:
            cache.set(version_key, 2, timeout=None)
        delete_cache_keys_with_prefix(f"community_page:{cid}:")
        delete_cache_keys_with_prefix(f"dashboard:{cid}:")
    else:
        delete_cache_keys_with_prefix("community_page:")
        delete_cache_keys_with_prefix("dashboard:")
        delete_cache_pattern("dashboard_*")


def invalidate_dashboard_cache(community_id=None) -> None:
    invalidate_community_page_caches(community_id)


def invalidate_discussion_cache(discussion_id) -> None:
    if not discussion_id:
        return
    cache.delete(discussion_detail_key(discussion_id))
    cache.delete(discussion_replies_key(discussion_id))
    delete_cache_keys_with_prefix(f"discussion_detail:{discussion_id}")
    delete_cache_keys_with_prefix(f"discussion_replies_{discussion_id}")
    delete_cache_keys_with_prefix(f"discussion_{discussion_id}")


def invalidate_post_caches(post=None, *, community_id=None) -> None:
    cid = community_id
    if post is not None and cid is None:
        cid = community_id_for_user(post.author)
    if cid:
        invalidate_feed_cache(cid)
        invalidate_community_page_caches(cid)
    if post is not None and getattr(post, "pk", None):
        cache.delete(post_key(post.pk))
        delete_cache_keys_with_prefix(f"post_{post.pk}")


def invalidate_vacancy_caches(vacancy=None, *, community_id=None) -> None:
    cid = community_id or (getattr(vacancy, "community_id", None) if vacancy else None)
    if cid:
        invalidate_community_page_caches(cid)
        invalidate_feed_cache(cid)
    if vacancy is not None and getattr(vacancy, "pk", None):
        cache.delete(vacancy_key(vacancy.pk))
        delete_cache_keys_with_prefix(f"vacancy_{vacancy.pk}")


def invalidate_membership_caches(community_id) -> None:
    if not community_id:
        return
    invalidate_community_page_caches(community_id)
    invalidate_feed_cache(community_id)
    cache.delete(community_key(community_id))
    delete_cache_keys_with_prefix(f"community_{community_id}")


def invalidate_discussion_reply_caches(reply) -> None:
    if not reply:
        return
    invalidate_discussion_cache(reply.topic_id)
