"""
Community dashboard page cache (analytics, events, announcements, vacancies, etc.).
"""
import json
import logging
from collections.abc import Callable
from typing import Any

from django.conf import settings
from django.core.cache import cache
from rest_framework.renderers import JSONRenderer

from .cache_keys import community_page_version_key

logger = logging.getLogger("hckonnect.cache")

COMMUNITY_PAGE_CACHE_TIMEOUT = getattr(
    settings,
    "COMMUNITY_PAGE_CACHE_TIMEOUT",
    getattr(settings, "DASHBOARD_CACHE_TIMEOUT", 60),
)


def build_community_page_cache_key(community_id, suffix: str) -> str:
    cid = str(community_id)
    version = cache.get(community_page_version_key(cid), 1)
    return f"community_page:{cid}:{suffix}:v{version}"


def to_json_cacheable(data: Any) -> Any:
    return json.loads(JSONRenderer().render(data))


def get_cached_community_page(
    community_id,
    suffix: str,
    fetch_from_db: Callable[[], Any],
    *,
    log_label: str,
) -> Any:
    """cache check → return if hit → else DB fetch → cache set → return."""
    community_id = str(community_id)
    cache_key = build_community_page_cache_key(community_id, suffix)

    cached = cache.get(cache_key)
    if cached is not None:
        logger.info(
            "CACHE HIT - %s key=%s community_id=%s",
            log_label,
            cache_key,
            community_id,
        )
        return cached

    logger.info(
        "CACHE MISS - %s key=%s community_id=%s",
        log_label,
        cache_key,
        community_id,
    )
    logger.info("DB FETCH - %s community_id=%s", log_label, community_id)

    payload = to_json_cacheable(fetch_from_db())
    cache.set(cache_key, payload, timeout=COMMUNITY_PAGE_CACHE_TIMEOUT)

    if cache.get(cache_key) is None:
        logger.error("CACHE SET FAILED - %s key=%s", log_label, cache_key)
    else:
        logger.info(
            "CACHE SET - %s key=%s ttl=%ss",
            log_label,
            cache_key,
            COMMUNITY_PAGE_CACHE_TIMEOUT,
        )
    return payload


def prepare_list_api_view(view, request) -> None:
    """
    Initialize a ListAPIView outside normal DRF dispatch (cache builders, summaries).

    ``setup()`` alone does not set ``format_kwarg`` on all DRF versions; without it,
    ``get_serializer_context()`` raises AttributeError.
    """
    view.setup(request)
    if not hasattr(view, "format_kwarg"):
        view.format_kwarg = None


def build_paginated_list_payload(list_view) -> dict:
    """Serialize a DRF ListAPIView page into a paginated dict for caching."""
    if not hasattr(list_view, "format_kwarg"):
        list_view.format_kwarg = None
    queryset = list_view.filter_queryset(list_view.get_queryset())
    page = list_view.paginate_queryset(queryset)
    if page is not None:
        serializer = list_view.get_serializer(page, many=True)
        return list_view.get_paginated_response(serializer.data).data
    serializer = list_view.get_serializer(queryset, many=True)
    return to_json_cacheable(serializer.data)


def dashboard_page_params_match(request) -> bool:
    """Default query params used by CommunityDashboard.jsx."""
    return (
        request.query_params.get("page", "1") == "1"
        and request.query_params.get("page_size", "20") == "20"
    )
