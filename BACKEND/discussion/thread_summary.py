"""
Aggregated discussion thread payload (topic detail + cursor-paginated replies).

Cache keys (TTL = DISCUSSION_THREAD_CACHE_TIMEOUT, default 3000s):
  discussion_detail:{topic_id}
  discussion_replies_{topic_id}  (full reply tree; paginated per request)
"""
import copy

from django.conf import settings
from django.db.models import Count
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from services.cache import get_or_set_cache
from services.cache.cache_keys import discussion_detail_key
from services.cache.cache_trace import format_query_context
from services.cache.community_page_cache import to_json_cacheable
from utils.comment_cursor import parse_limit

from .models import DiscussionPanel, Reaction
from .permissions import CanAccessDiscussion
from .reply_cache import (
    apply_user_likes_to_replies,
    get_cached_discussion_replies,
    paginate_serialized_replies,
)
from .serializers import DiscussionReadSerializer, ReplyReadSerializer

DISCUSSION_THREAD_CACHE_TIMEOUT = getattr(
    settings,
    "DISCUSSION_THREAD_CACHE_TIMEOUT",
    getattr(settings, "DISCUSSION_REPLIES_CACHE_TIMEOUT", 3000),
)


def _strip_user_likes_from_detail(data: dict) -> dict:
    payload = copy.deepcopy(data)
    payload["user_has_liked"] = False
    return payload


def apply_user_likes_to_detail(data: dict, request, topic_id) -> dict:
    result = copy.deepcopy(data)
    user = request.user
    if not getattr(user, "is_authenticated", False):
        result["user_has_liked"] = False
        return result
    result["user_has_liked"] = Reaction.objects.filter(
        user=user,
        topic_id=topic_id,
        reply__isnull=True,
    ).exists()
    return result


def _detail_queryset():
    return (
        DiscussionPanel.objects.select_related("created_by", "community")
        .prefetch_related("reactions")
        .annotate(_reply_count_total=Count("replies"))
    )


def _fetch_detail_from_db(request, topic_id) -> dict:
    topic = get_object_or_404(_detail_queryset(), pk=topic_id)
    permission = CanAccessDiscussion()
    if not permission.has_object_permission(request, None, topic):
        raise PermissionDenied("You cannot access this discussion.")
    context = {
        "request": request,
        "omit_nested_replies": True,
    }
    if request.user.is_authenticated:
        context["liked_topic_ids"] = set(
            Reaction.objects.filter(
                user=request.user,
                topic_id=topic_id,
                reply__isnull=True,
            ).values_list("topic_id", flat=True)
        )
    else:
        context["liked_topic_ids"] = set()
    return DiscussionReadSerializer(topic, context=context).data


def get_cached_discussion_detail(request, topic_id) -> dict:
    """Redis key: discussion_detail:{topic_id}"""
    cache_key = discussion_detail_key(topic_id)
    log_ctx = format_query_context(topic_id=topic_id)

    def fetch():
        return _strip_user_likes_from_detail(
            to_json_cacheable(_fetch_detail_from_db(request, topic_id))
        )

    cached = get_or_set_cache(
        cache_key,
        DISCUSSION_THREAD_CACHE_TIMEOUT,
        fetch,
        log_label="discussion_detail",
        log_context=log_ctx,
    )
    return apply_user_likes_to_detail(cached, request, topic_id)


def _build_replies_payload(request, topic_id, cursor: str | None, limit: int) -> dict:
    cached_replies = get_cached_discussion_replies(
        topic_id, request, ReplyReadSerializer
    )
    replies = apply_user_likes_to_replies(cached_replies, request.user)
    page, next_cursor, has_more = paginate_serialized_replies(replies, cursor, limit)
    return {
        "results": page,
        "next": next_cursor,
        "previous": None,
        "has_more": has_more,
    }


def build_thread_summary(request, topic_id, *, cursor: str | None = None, limit: int = 14) -> dict:
    limit = parse_limit(limit, default=14)
    return {
        "detail": get_cached_discussion_detail(request, topic_id),
        "replies": _build_replies_payload(request, topic_id, cursor, limit),
    }


class DiscussionThreadSummaryView(APIView):
    """
    Single round-trip discussion thread payload.
    GET /discussions/thread-summary/<topic_id>/?limit=14&cursor=
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, topic_id):
        cursor = request.query_params.get("cursor") or None
        limit = parse_limit(request.query_params.get("limit"), default=14)
        return Response(build_thread_summary(request, topic_id, cursor=cursor, limit=limit))
