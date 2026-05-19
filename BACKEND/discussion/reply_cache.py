"""
Discussion reply cache read helpers (invalidation lives in services.cache.cache_invalidation).
"""
import copy
from uuid import UUID

from django.conf import settings
from django.db.models import Prefetch
from django.utils.dateparse import parse_datetime

from services.cache import get_or_set_cache
from services.cache.cache_keys import discussion_replies_key
from services.cache.cache_trace import format_query_context
from utils.comment_cursor import (
    collect_discussion_reply_tree_ids,
    decode_comment_cursor,
    encode_comment_cursor,
)

from .models import DiscussionReply, Reaction

DISCUSSION_REPLIES_CACHE_TIMEOUT = getattr(
    settings,
    "DISCUSSION_REPLIES_CACHE_TIMEOUT",
    getattr(settings, "DISCUSSION_THREAD_CACHE_TIMEOUT", 3000),
)


def get_top_level_replies_queryset(topic_id):
    """Optimized queryset for a full discussion reply tree (top-level + nested)."""
    grandchild_qs = (
        DiscussionReply.objects.select_related(
            "created_by", "created_by__membership__community"
        )
        .prefetch_related("reactions")
        .order_by("-created_at", "-id")
    )
    child_qs = (
        DiscussionReply.objects.select_related(
            "created_by", "created_by__membership__community"
        )
        .prefetch_related(Prefetch("children", queryset=grandchild_qs), "reactions")
        .order_by("-created_at", "-id")
    )
    return (
        DiscussionReply.objects.filter(topic_id=topic_id, parent_reply__isnull=True)
        .select_related("created_by", "topic", "created_by__membership__community")
        .prefetch_related(Prefetch("children", queryset=child_qs), "reactions")
        .order_by("-created_at", "-id")
    )


def build_reply_serializer_context(page_objs, user) -> dict:
    if not getattr(user, "is_authenticated", False) or not page_objs:
        return {}
    ids = collect_discussion_reply_tree_ids(page_objs)
    if not ids:
        return {}
    return {
        "liked_reply_ids": set(
            Reaction.objects.filter(user=user, reply_id__in=ids).values_list(
                "reply_id", flat=True
            )
        )
    }


def strip_user_likes_from_replies(replies: list) -> list:
    cached = copy.deepcopy(replies)

    def walk(items):
        for item in items:
            item["user_has_liked"] = False
            walk(item.get("replies") or [])

    walk(cached)
    return cached


def _collect_serialized_reply_ids(replies: list) -> list:
    ids = []
    stack = list(replies)
    while stack:
        reply = stack.pop()
        ids.append(reply["id"])
        stack.extend(reply.get("replies") or [])
    return ids


def apply_user_likes_to_replies(replies: list, user) -> list:
    result = copy.deepcopy(replies)
    if not getattr(user, "is_authenticated", False):
        return result

    ids = _collect_serialized_reply_ids(result)
    if not ids:
        return result

    liked_str = {
        str(pk)
        for pk in Reaction.objects.filter(user=user, reply_id__in=ids).values_list(
            "reply_id", flat=True
        )
    }

    def walk(items):
        for item in items:
            item["user_has_liked"] = str(item["id"]) in liked_str
            walk(item.get("replies") or [])

    walk(result)
    return result


def _reply_created_at(reply: dict):
    created_at = reply["created_at"]
    if isinstance(created_at, str):
        return parse_datetime(created_at)
    return created_at


def paginate_serialized_replies(replies: list, cursor: str | None, limit: int):
    """Apply cursor pagination to cached top-level replies (-created_at, -id)."""
    ordered = replies
    if cursor:
        ts, pk = decode_comment_cursor(cursor)
        ordered = [
            reply
            for reply in replies
            if (_reply_created_at(reply) < ts)
            or (_reply_created_at(reply) == ts and UUID(str(reply["id"])) < pk)
        ]

    batch = ordered[: limit + 1]
    has_more = len(batch) > limit
    page = batch[:limit]
    next_cursor = None
    if has_more and page:
        last = page[-1]
        next_cursor = encode_comment_cursor(_reply_created_at(last), UUID(str(last["id"])))
    return page, next_cursor, has_more


def _replies_log_context(topic_id, request) -> str:
    qp = request.query_params
    return format_query_context(
        topic_id=topic_id,
        cursor=qp.get("cursor") or "none",
        limit=qp.get("limit", "12"),
    )


def get_cached_discussion_replies(topic_id, request, serializer_class):
    """
    Return full serialized reply tree for a discussion, using Redis when possible.

    Redis key: discussion_replies_{topic_id} (see cache_keys.discussion_replies_key).
    """
    def fetch_replies():
        all_objs = list(get_top_level_replies_queryset(topic_id))
        context = {"request": request}
        context.update(build_reply_serializer_context(all_objs, request.user))
        data = serializer_class(all_objs, many=True, context=context).data
        return strip_user_likes_from_replies(data)

    return get_or_set_cache(
        discussion_replies_key(topic_id),
        DISCUSSION_REPLIES_CACHE_TIMEOUT,
        fetch_replies,
        log_label="discussion_replies",
        log_context=_replies_log_context(topic_id, request),
    )
