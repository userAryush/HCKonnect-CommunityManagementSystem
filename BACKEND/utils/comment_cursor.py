from __future__ import annotations

"""
Cursor-based pagination for comment-style models ordered by (-created_at, -id).

Uses an opaque base64url token encoding (created_at ISO + UUID) so pages stay stable
when new rows are inserted at the top. Offset pagination would skip/duplicate rows
when the list shifts between requests.
"""
import base64
import json
from uuid import UUID

from django.db.models import Q, QuerySet
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response


def encode_comment_cursor(created_at, pk) -> str:
    if timezone.is_naive(created_at):
        created_at = timezone.make_aware(created_at)
    payload = {"t": created_at.isoformat(), "i": str(pk)}
    raw = json.dumps(payload, separators=(",", ":")).encode()
    return base64.urlsafe_b64encode(raw).decode().rstrip("=")


def decode_comment_cursor(token: str):
    if not token or not isinstance(token, str):
        raise ValidationError("Invalid cursor")
    pad = "=" * (-len(token) % 4)
    try:
        raw = base64.urlsafe_b64decode(token + pad)
        payload = json.loads(raw.decode())
        ts = parse_datetime(payload["t"])
        if ts is None:
            raise ValueError("bad timestamp")
        if timezone.is_naive(ts):
            ts = timezone.make_aware(ts)
        pk = UUID(payload["i"])
        return ts, pk
    except (ValueError, KeyError, json.JSONDecodeError) as e:
        raise ValidationError("Invalid cursor") from e


def apply_comment_cursor_filter(qs: QuerySet, cursor_token: str | None) -> QuerySet:
    """Keep sort order -created_at, -id on qs before calling this."""
    if not cursor_token:
        return qs
    ts, pk = decode_comment_cursor(cursor_token)
    return qs.filter(Q(created_at__lt=ts) | Q(created_at=ts, id__lt=pk))


def collect_discussion_reply_tree_ids(page_objs) -> list:
    """Walk prefetched `children` trees (DiscussionReply) for bulk queries."""
    ids = []
    stack = list(page_objs)
    while stack:
        node = stack.pop()
        ids.append(node.pk)
        cache = getattr(node, "_prefetched_objects_cache", {})
        children = cache.get("children")
        if children is not None:
            stack.extend(children)
        else:
            stack.extend(list(node.children.all()))
    return ids


def collect_post_comment_tree_ids(page_objs) -> list:
    """Walk prefetched `replies` trees (PostComment) for bulk queries."""
    ids = []
    stack = list(page_objs)
    while stack:
        node = stack.pop()
        ids.append(node.pk)
        cache = getattr(node, "_prefetched_objects_cache", {})
        replies = cache.get("replies")
        if replies is not None:
            stack.extend(replies)
        else:
            stack.extend(list(node.replies.all()))
    return ids


def parse_limit(raw_limit, default: int = 22, cap: int = 50) -> int:
    try:
        n = int(raw_limit)
    except (TypeError, ValueError):
        n = default
    return max(1, min(n, cap))


def cursor_paginated_comment_response(
    queryset: QuerySet,
    serializer_class,
    request,
    *,
    limit: int,
    extra_context: dict | None = None,
    extra_context_callback=None,
):
    """
    Take limit+1 rows to detect has_more without a separate COUNT query.
    extra_context_callback(page_objs, request) may return dict merged into serializer context
    (e.g. bulk liked ids) to avoid N+1 SerializerMethodFields.
    """
    batch = list(queryset[: limit + 1])
    has_more = len(batch) > limit
    page_objs = batch[:limit]
    context = {"request": request}
    if extra_context:
        context.update(extra_context)
    if extra_context_callback:
        add = extra_context_callback(page_objs, request)
        if add:
            context.update(add)
    data = serializer_class(page_objs, many=True, context=context).data
    next_cursor = None
    if has_more and page_objs:
        last = page_objs[-1]
        next_cursor = encode_comment_cursor(last.created_at, last.id)
    return Response(
        {
            "comments": data,
            "next_cursor": next_cursor,
            "has_more": has_more,
        }
    )
