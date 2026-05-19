"""
Aggregated community dashboard payload (single HTTP round-trip).

Each section uses the same Redis keys as the standalone list/stats endpoints, e.g.:
  community_page:{community_id}:dashboard:v{version}
  community_page:{community_id}:analytics:v{version}
  community_page:{community_id}:events:p1:ps20:v{version}
See services.cache.community_page_cache.build_community_page_cache_key.
"""
import logging

from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from contents.views import AnnouncementListView, AnnouncementStatsView
from events.views import EventListView, EventStatsView
from services.cache.community_page_cache import (
    build_community_page_cache_key,
    build_paginated_list_payload,
    get_cached_community_page,
    prepare_list_api_view,
)
from .dashboard_cache import get_cached_dashboard
from .permissions import IsCommunityAccount
from .serializers import CommunityDashboardSerializer

logger = logging.getLogger("hckonnect.cache")
User = get_user_model()

# Logical cache suffixes (full key = community_page:{id}:{suffix}:v{version})
CACHE_SUFFIX_DASHBOARD = "dashboard"
CACHE_SUFFIX_ANALYTICS = "analytics"
CACHE_SUFFIX_ANALYTICS_PLATFORM = "analytics:platform"
CACHE_SUFFIX_EVENTS_LIST = "events:p1:ps20"
CACHE_SUFFIX_EVENTS_STATS = "events:stats"
CACHE_SUFFIX_ANNOUNCEMENTS_STATS = "announcements:stats"
CACHE_SUFFIX_VACANCIES_LIST = "vacancies:ALL:-created_at"


def _announcements_list_suffix(request) -> str:
    user_id = request.user.id if request.user.is_authenticated else "anonymous"
    return f"announcements:p1:ps20:u{user_id}"


def _bind_list_query_params(request: Request, community_id, *, vacancies: bool = False) -> None:
    """Mirror CommunityDashboard.jsx defaults (page=1, page_size=20)."""
    query = request._request.GET.copy()
    query["community_id"] = str(community_id)
    query["page"] = "1"
    query["page_size"] = "20"
    if vacancies:
        query["status"] = "ALL"
        query["sort"] = "-created_at"
    request._request.GET = query


def _list_results(cached_payload):
    """Unwrap StandardPagination dict to a plain list for the summary response."""
    if isinstance(cached_payload, dict) and "results" in cached_payload:
        return cached_payload["results"]
    return cached_payload


def _fetch_dashboard(request, community_id) -> dict:
    from .views import CommunityDashboardView

    view = CommunityDashboardView()
    view.setup(request, pk=community_id)

    def fetch_from_db():
        instance = view.get_object()
        return CommunityDashboardSerializer(instance, context={"request": request}).data

    # Key: community_page:{community_id}:dashboard:v{version}
    return get_cached_dashboard(community_id, request, fetch_from_db)


def _fetch_analytics(request, community_id) -> dict:
    from .views import CommunityAnalyticsView

    analytics_view = CommunityAnalyticsView()
    analytics_view.request = request
    analytics_view.format_kwarg = None
    # Key: community_page:{community_id}:analytics:v{version}
    #   or community_page:{community_id}:analytics:platform:v{version}
    return analytics_view.build_analytics_data(request, community_id)


def _fetch_events_list(request, community_id) -> list:
    _bind_list_query_params(request, community_id)
    view = EventListView()
    prepare_list_api_view(view, request)

    def fetch():
        return build_paginated_list_payload(view)

    # Key: community_page:{community_id}:events:p1:ps20:v{version}
    cache_key = build_community_page_cache_key(community_id, CACHE_SUFFIX_EVENTS_LIST)
    logger.debug("summary events cache key=%s", cache_key)
    cached = get_cached_community_page(
        community_id,
        CACHE_SUFFIX_EVENTS_LIST,
        fetch,
        log_label="events",
    )
    return _list_results(cached)


def _fetch_events_stats(community_id) -> dict:
    stats_view = EventStatsView()

    def fetch():
        return stats_view._build_stats(community_id)

    # Key: community_page:{community_id}:events:stats:v{version}
    return get_cached_community_page(
        community_id,
        CACHE_SUFFIX_EVENTS_STATS,
        fetch,
        log_label="events_stats",
    )


def _fetch_announcements_list(request, community_id) -> list:
    _bind_list_query_params(request, community_id)
    view = AnnouncementListView()
    prepare_list_api_view(view, request)
    suffix = _announcements_list_suffix(request)

    def fetch():
        return build_paginated_list_payload(view)

    # Key: community_page:{community_id}:announcements:p1:ps20:u{user_id}:v{version}
    cache_key = build_community_page_cache_key(community_id, suffix)
    logger.debug("summary announcements cache key=%s", cache_key)
    cached = get_cached_community_page(
        community_id,
        suffix,
        fetch,
        log_label="announcements",
    )
    return _list_results(cached)


def _fetch_announcements_stats(community_id) -> dict:
    stats_view = AnnouncementStatsView()

    def fetch():
        return stats_view._build_stats(community_id)

    # Key: community_page:{community_id}:announcements:stats:v{version}
    return get_cached_community_page(
        community_id,
        CACHE_SUFFIX_ANNOUNCEMENTS_STATS,
        fetch,
        log_label="announcements_stats",
    )


def _fetch_vacancies_list(request, community_id) -> list:
    from .views import ListCommunityVacanciesView

    _bind_list_query_params(request, community_id, vacancies=True)
    view = ListCommunityVacanciesView()
    prepare_list_api_view(view, request)

    def fetch():
        return build_paginated_list_payload(view)

    # Key: community_page:{community_id}:vacancies:ALL:-created_at:v{version}
    cache_key = build_community_page_cache_key(community_id, CACHE_SUFFIX_VACANCIES_LIST)
    logger.debug("summary vacancies cache key=%s", cache_key)
    cached = get_cached_community_page(
        community_id,
        CACHE_SUFFIX_VACANCIES_LIST,
        fetch,
        log_label="vacancies",
    )
    return _list_results(cached)


def build_dashboard_summary(request, community_id) -> dict:
    """
    Assemble all dashboard sections from cache (or DB on miss).
    Uses the same keys/TTL as the individual endpoints (COMMUNITY_PAGE_CACHE_TIMEOUT).
    """
    get_object_or_404(User, id=community_id, role="community")

    # Same gate as CommunityAnalyticsView (IsCommunityAccount).
    analytics = (
        _fetch_analytics(request, community_id)
        if IsCommunityAccount().has_permission(request, None)
        else {}
    )

    return {
        "dashboard": _fetch_dashboard(request, community_id),
        "analytics": analytics,
        "events": _fetch_events_list(request, community_id),
        "events_stats": _fetch_events_stats(community_id),
        "announcements": _fetch_announcements_list(request, community_id),
        "announcements_stats": _fetch_announcements_stats(community_id),
        "vacancies": _fetch_vacancies_list(request, community_id),
    }


class CommunityDashboardSummaryView(APIView):
    """
    Single round-trip dashboard payload (all sections share existing Redis keys).
    GET /communities/<community_id>/summary/
    """

    permission_classes = [AllowAny]

    def get(self, request, community_id):
        return Response(build_dashboard_summary(request, community_id))
