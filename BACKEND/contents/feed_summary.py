"""
Aggregated user feed page payload (timeline + sidebar widgets).

Cache keys (TTL = USER_FEED_CACHE_TIMEOUT, default 3000s):
  user_feed:timeline:u{user_id}:p{page}:ps{page_size}
  user_feed:announcements:u{user_id}:p{page}:ps{page_size}
  user_feed:events:u{user_id}:p{page}:ps{page_size}
  user_feed:profile:u{user_id}
"""
from django.conf import settings
from django.core.paginator import Paginator
from django.utils import timezone
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.serializers import UserProfileDetailSerializer
from communities.models import CommunityMembership
from events.models import Event, EventRegistration
from events.serializers import EventSerializer
from events.views import EventListView
from services.cache import get_or_set_cache
from services.cache.cache_keys import (
    user_feed_announcements_key,
    user_feed_events_key,
    user_feed_profile_key,
    user_feed_timeline_key,
)
from services.cache.cache_trace import format_query_context
from services.cache.community_page_cache import (
    build_paginated_list_payload,
    prepare_list_api_view,
    to_json_cacheable,
)

from .feed_cache import apply_user_likes_to_feed, strip_user_specific_feed_fields
from .views import AnnouncementListView, FeedListView

USER_FEED_CACHE_TIMEOUT = getattr(
    settings,
    "USER_FEED_CACHE_TIMEOUT",
    getattr(settings, "DASHBOARD_CACHE_TIMEOUT", 3000),
)


def _cache_user_id(request) -> str:
    if request.user.is_authenticated:
        return str(request.user.id)
    return "anonymous"


def _paginate_items(items, page: int, page_size: int) -> dict:
    paginator = Paginator(items, page_size)
    page_obj = paginator.get_page(page)
    return {
        "count": paginator.count,
        "total_pages": paginator.num_pages,
        "current_page": page_obj.number,
        "next": page_obj.next_page_number() if page_obj.has_next() else None,
        "previous": page_obj.previous_page_number() if page_obj.has_previous() else None,
        "results": list(page_obj.object_list),
    }


def _bind_query_params(request, page: int, page_size: int) -> None:
    query = request._request.GET.copy()
    query["page"] = str(page)
    query["page_size"] = str(page_size)
    request._request.GET = query


def _fetch_timeline_page(request, page: int, page_size: int) -> dict:
    user_id = _cache_user_id(request)
    cache_key = user_feed_timeline_key(user_id, page, page_size)
    log_ctx = format_query_context(
        user_id=user_id,
        page=page,
        page_size=page_size,
    )

    def fetch():
        feed_view = FeedListView()
        prepare_list_api_view(feed_view, request)
        items = feed_view._build_feed_items(request, None, "all")
        stripped = strip_user_specific_feed_fields(items)
        return to_json_cacheable(_paginate_items(stripped, page, page_size))

    cached_page = get_or_set_cache(
        cache_key,
        USER_FEED_CACHE_TIMEOUT,
        fetch,
        log_label="user_feed_timeline",
        log_context=log_ctx,
    )
    payload = dict(cached_page)
    payload["results"] = apply_user_likes_to_feed(payload.get("results") or [], request.user)
    return payload


def _list_results(cached_payload):
    if isinstance(cached_payload, dict) and "results" in cached_payload:
        return cached_payload["results"]
    return cached_payload


def _fetch_announcements(request, page: int, page_size: int) -> list:
    user_id = _cache_user_id(request)
    cache_key = user_feed_announcements_key(user_id, page, page_size)
    log_ctx = format_query_context(user_id=user_id, page=page, page_size=page_size)

    def fetch():
        _bind_query_params(request, page, page_size)
        view = AnnouncementListView()
        prepare_list_api_view(view, request)
        return build_paginated_list_payload(view)

    cached = get_or_set_cache(
        cache_key,
        USER_FEED_CACHE_TIMEOUT,
        fetch,
        log_label="user_feed_announcements",
        log_context=log_ctx,
    )
    return _list_results(cached)


def _fetch_events(request, page: int, page_size: int) -> list:
    user_id = _cache_user_id(request)
    cache_key = user_feed_events_key(user_id, page, page_size)
    log_ctx = format_query_context(user_id=user_id, page=page, page_size=page_size)

    def fetch():
        _bind_query_params(request, page, page_size)
        view = EventListView()
        prepare_list_api_view(view, request)
        return build_paginated_list_payload(view)

    cached = get_or_set_cache(
        cache_key,
        USER_FEED_CACHE_TIMEOUT,
        fetch,
        log_label="user_feed_events",
        log_context=log_ctx,
    )
    return _list_results(cached)


def _build_feed_sidebar_stats(user, profile_data: dict) -> dict:
    if user.role == "community":
        from django.contrib.auth import get_user_model

        community = get_user_model().objects.filter(id=user.id, role="community").first()
        member_count = (
            CommunityMembership.objects.filter(community_id=user.id).count()
            if community
            else 0
        )
        upcoming = Event.objects.filter(
            community_id=user.id,
            date__gte=timezone.now().date(),
        ).count()
        posts = len(
            [item for item in profile_data.get("posted_content", []) if item.get("type") == "post"]
        )
        return {
            "posts": posts,
            "members_count": member_count,
            "upcoming_events": upcoming,
            "is_community_account": True,
        }

    posted = profile_data.get("posted_content", [])
    return {
        "posts": len([item for item in posted if item.get("type") == "post"]),
        "discussions": len([item for item in posted if item.get("type") == "discussion"]),
        "registered_events_count": EventRegistration.objects.filter(user=user).count(),
        "is_community_account": False,
    }


def _fetch_profile(request) -> dict:
    if not request.user.is_authenticated:
        return {}

    user_id = _cache_user_id(request)
    cache_key = user_feed_profile_key(user_id)
    log_ctx = format_query_context(user_id=user_id)

    def fetch():
        data = UserProfileDetailSerializer(request.user, context={"request": request}).data
        data["feed_sidebar_stats"] = _build_feed_sidebar_stats(request.user, data)
        return to_json_cacheable(data)

    return get_or_set_cache(
        cache_key,
        USER_FEED_CACHE_TIMEOUT,
        fetch,
        log_label="user_feed_profile",
        log_context=log_ctx,
    )


def build_feed_summary(request, page: int = 1, page_size: int = 20) -> dict:
    page = max(int(page), 1)
    page_size = max(min(int(page_size), 100), 1)

    return {
        "feed": _fetch_timeline_page(request, page, page_size),
        "announcements": _fetch_announcements(request, page, page_size),
        "events": _fetch_events(request, page, page_size),
        "profile": _fetch_profile(request),
    }


class UserFeedSummaryView(APIView):
    """
    Single round-trip payload for the user Feed page.
    GET /contents/feed-summary/?page=1&page_size=20
    """

    permission_classes = [AllowAny]

    def get(self, request):
        page = request.query_params.get("page", "1")
        page_size = request.query_params.get("page_size", "20")
        try:
            page_i = int(page)
            page_size_i = int(page_size)
        except (TypeError, ValueError):
            return Response({"detail": "page and page_size must be integers."}, status=400)

        return Response(build_feed_summary(request, page_i, page_size_i))
