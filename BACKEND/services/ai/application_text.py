"""Validation for student-facing AI helpers (applications, discussions, event fields)."""

from __future__ import annotations

from typing import Any

from rest_framework import status
from rest_framework.response import Response

from services.ai.vacancy_description import ALLOWED_ENHANCE_ACTIONS

_ALLOWED_TEXT_ENHANCE_DOMAINS: frozenset[str] = frozenset(
    {"application", "discussion", "event_description", "event_expectations"}
)


def parse_application_text_enhance_request(data: dict, user) -> tuple[dict[str, str] | None, Response | None]:
    """Authenticated users may rewrite their own application / cover letter text."""
    if not getattr(user, "is_authenticated", False):
        return None, Response(
            {"error": "Authentication required."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not isinstance(data, dict):
        return None, Response({"error": "Invalid JSON body."}, status=status.HTTP_400_BAD_REQUEST)

    text = data.get("text")
    if not isinstance(text, str) or not text.strip():
        return None, Response(
            {"error": "'text' is required and must be a non-empty string."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    action_type = data.get("action_type")
    if not isinstance(action_type, str) or not action_type.strip():
        return None, Response(
            {"error": "'action_type' is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    action_type = action_type.strip().lower().replace(" ", "_").replace("-", "_")
    if action_type not in ALLOWED_ENHANCE_ACTIONS:
        return None, Response(
            {
                "error": f"Invalid 'action_type'. Allowed: {', '.join(sorted(ALLOWED_ENHANCE_ACTIONS))}.",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    raw_domain = data.get("domain", "application")
    if not isinstance(raw_domain, str) or not raw_domain.strip():
        domain = "application"
    else:
        domain = raw_domain.strip().lower()
    if domain not in _ALLOWED_TEXT_ENHANCE_DOMAINS:
        return None, Response(
            {
                "error": f"Invalid 'domain'. Allowed: {', '.join(sorted(_ALLOWED_TEXT_ENHANCE_DOMAINS))}.",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    return {"text": text.strip(), "action_type": action_type, "domain": domain}, None
