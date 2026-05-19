"""
Standardized cache trace logging for feed, posts, and discussion APIs.

Uses logger ``hckonnect.cache`` (console INFO) — same as community_page_cache.
"""
import logging

logger = logging.getLogger("hckonnect.cache")


def format_query_context(**params) -> str:
    """Build trailing context: `` community_id=1 page=1``."""
    parts = []
    for key, value in params.items():
        if value is None:
            continue
        parts.append(f"{key}={value}")
    return (" " + " ".join(parts)) if parts else ""


def log_uncached_fetch(log_label: str, **params) -> None:
    """Log endpoints with no Redis layer (always hits the database)."""
    ctx = format_query_context(**params)
    logger.info("CACHE MISS - %s key=n/a (uncached)%s", log_label, ctx)
    logger.info("DB FETCH - %s%s", log_label, ctx)
