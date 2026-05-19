"""
Shared Redis cache helpers using django.core.cache.
"""
import logging
from collections.abc import Callable
from typing import TypeVar

from django.core.cache import cache

logger = logging.getLogger("hckonnect.cache")

T = TypeVar("T")


def get_or_set_cache(
    key: str,
    timeout: int,
    function_to_fetch_data: Callable[[], T],
    *,
    log_label: str = "cache",
    log_context: str = "",
) -> T:
    """
    Return cached value for ``key`` if present; otherwise call
    ``function_to_fetch_data``, store the result, and return it.
    """
    ctx = log_context if log_context.startswith(" ") or not log_context else f" {log_context}"

    cached = cache.get(key)
    if cached is not None:
        logger.info("CACHE HIT - %s key=%s%s", log_label, key, ctx)
        return cached

    logger.info("CACHE MISS - %s key=%s%s", log_label, key, ctx)
    logger.info("DB FETCH - %s%s", log_label, ctx)

    result = function_to_fetch_data()
    cache.set(key, result, timeout=timeout)

    if cache.get(key) is None:
        logger.error("CACHE SET FAILED - %s key=%s", log_label, key)
    else:
        logger.info("CACHE SET - %s key=%s ttl=%ss", log_label, key, timeout)

    return result
