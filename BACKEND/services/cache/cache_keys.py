"""
Canonical Redis cache key builders (logical keys; Django adds prefix/version).
"""


def feed_key(community_id) -> str:
    return f"feed_{community_id}"


def user_feed_timeline_key(user_id, page: int, page_size: int) -> str:
    return f"user_feed:timeline:u{user_id}:p{page}:ps{page_size}"


def user_feed_announcements_key(user_id, page: int, page_size: int) -> str:
    return f"user_feed:announcements:u{user_id}:p{page}:ps{page_size}"


def user_feed_events_key(user_id, page: int, page_size: int) -> str:
    return f"user_feed:events:u{user_id}:p{page}:ps{page_size}"


def user_feed_profile_key(user_id) -> str:
    return f"user_feed:profile:u{user_id}"


def community_page_version_key(community_id) -> str:
    """Shared version counter for all community page caches (dashboard, analytics, …)."""
    return f"community_page:version:{community_id}"


def dashboard_version_key(community_id) -> str:
    return community_page_version_key(community_id)


def discussion_detail_key(topic_id) -> str:
    return f"discussion_detail:{topic_id}"


def discussion_replies_key(discussion_id) -> str:
    return f"discussion_replies_{discussion_id}"


def post_key(post_id) -> str:
    return f"post_{post_id}"


def vacancy_key(vacancy_id) -> str:
    return f"vacancy_{vacancy_id}"


def community_key(community_id) -> str:
    return f"community_{community_id}"
