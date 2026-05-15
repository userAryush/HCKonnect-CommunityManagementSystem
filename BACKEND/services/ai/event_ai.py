"""Validation for AI-assisted community event copy (generate description / what to expect)."""

from __future__ import annotations

from typing import Any

from rest_framework import status
from rest_framework.response import Response


def _optional_trimmed_str(data: dict[str, Any], key: str, max_len: int) -> tuple[str, Response | None]:
    raw = data.get(key, "")
    if raw is None:
        return "", None
    if not isinstance(raw, str):
        return "", Response(
            {"error": f"'{key}' must be a string."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    return raw.strip()[:max_len], None


def parse_event_generate_request(data: dict[str, Any], user) -> tuple[dict[str, str] | None, Response | None]:
    if not getattr(user, "is_authenticated", False):
        return None, Response(
            {"error": "Authentication required."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not isinstance(data, dict):
        return None, Response({"error": "Invalid JSON body."}, status=status.HTTP_400_BAD_REQUEST)

    target_raw = data.get("target", "")
    if not isinstance(target_raw, str) or not target_raw.strip():
        return None, Response(
            {"error": "'target' is required and must be 'description' or 'what_to_expect'."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    target = target_raw.strip().lower().replace(" ", "_").replace("-", "_")
    if target == "whattoexpect":
        target = "what_to_expect"
    if target not in {"description", "what_to_expect"}:
        return None, Response(
            {"error": "'target' must be 'description' or 'what_to_expect'."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    title = data.get("title")
    if not isinstance(title, str) or not title.strip():
        return None, Response(
            {"error": "'title' is required and must be a non-empty string."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    date_s, err = _optional_trimmed_str(data, "date", 64)
    if err:
        return None, err
    start_time, err = _optional_trimmed_str(data, "start_time", 32)
    if err:
        return None, err
    end_time, err = _optional_trimmed_str(data, "end_time", 32)
    if err:
        return None, err
    event_format, err = _optional_trimmed_str(data, "format", 64)
    if err:
        return None, err
    location, err = _optional_trimmed_str(data, "location", 500)
    if err:
        return None, err
    description, err = _optional_trimmed_str(data, "description", 50_000)
    if err:
        return None, err
    existing_expectations, err = _optional_trimmed_str(data, "existing_expectations", 20_000)
    if err:
        return None, err
    optional_instructions, err = _optional_trimmed_str(data, "optional_ai_instructions", 2000)
    if err:
        return None, err

    return {
        "target": target,
        "title": title.strip(),
        "date": date_s,
        "start_time": start_time,
        "end_time": end_time,
        "event_format": event_format,
        "location": location,
        "description": description,
        "existing_expectations": existing_expectations,
        "optional_instructions": optional_instructions,
    }, None
