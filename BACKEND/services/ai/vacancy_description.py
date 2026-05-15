"""
HTTP-layer validation and community resolution for vacancy AI generation and text enhancement.

Prompt construction and model calls live in prompts.py and gemini_service.py.
"""

from __future__ import annotations

import uuid
from typing import Any

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.response import Response

from communities.models import CommunityMembership

User = get_user_model()

ALLOWED_TONES: frozenset[str] = frozenset(
    {
        "professional",
        "friendly",
        "short_concise",
        "detailed",
        "beginner_friendly",
    }
)
DEFAULT_TONE = "friendly"

ALLOWED_ENHANCE_ACTIONS: frozenset[str] = frozenset(
    {
        "improve",
        "professional",
        "academic",
        "friendly",
        "grammar",
        "concise",
        "expand",
        "engaging",
    }
)


def _looks_like_uuid(value: str) -> bool:
    try:
        uuid.UUID(str(value).strip())
    except (ValueError, TypeError, AttributeError):
        return False
    return True


def user_can_use_community_ai(user, community_id) -> bool:
    if not user or not user.is_authenticated:
        return False
    if str(user.pk) == str(community_id):
        return True
    if getattr(user, "role", None) == "admin":
        return True
    return CommunityMembership.objects.filter(
        user=user,
        community_id=community_id,
        role="representative",
    ).exists()


def _resolve_from_community_id(community_id) -> tuple[str | None, str, Response | None]:
    """
    Returns (display_name, community_description, error_response).
    display_name is never the raw id; uses community_name or username.
    """
    community = (
        User.objects.filter(pk=community_id, role="community")
        .only("community_name", "username", "community_description")
        .first()
    )
    if not community:
        return None, "", Response(
            {"error": "Community not found for the given community_id."},
            status=status.HTTP_404_NOT_FOUND,
        )
    name = (community.community_name or "").strip() or (community.username or "").strip()
    if not name or _looks_like_uuid(name):
        name = (community.username or "Community").strip()
    desc = (community.community_description or "").strip() if community.community_description else ""
    return name, desc, None


def parse_vacancy_ai_request(data: dict, user) -> tuple[dict[str, Any] | None, Response | None]:
    """
    Normalize and validate POST body for vacancy / job-description AI.

    Returns kwargs for GeminiService.generate_vacancy_description, or (None, error Response).

    With community_id: name and about-text are always loaded from the community profile on the server.
    contribution_areas and client-supplied community_description are ignored for context (optional legacy fields accepted).

    Legacy without community_id: community_name, member_role, contribution_areas (optional empty),
    community_context / community_description.
    """
    if not isinstance(data, dict):
        return None, Response({"error": "Invalid JSON body."}, status=status.HTTP_400_BAD_REQUEST)

    community_id = data.get("community_id")

    role_title = data.get("role_title") if data.get("role_title") is not None else data.get("member_role")
    if not isinstance(role_title, str) or not role_title.strip():
        return None, Response(
            {"error": "'role_title' (or legacy 'member_role') is required and must be a non-empty string."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    role_title = role_title.strip()

    raw_tone = data.get("tone") or data.get("tone_style") or DEFAULT_TONE
    if isinstance(raw_tone, str):
        raw_tone = raw_tone.strip().lower().replace(" ", "_").replace("-", "_")
    if not isinstance(raw_tone, str) or raw_tone not in ALLOWED_TONES:
        return None, Response(
            {
                "error": f"Invalid 'tone'. Allowed values: {', '.join(sorted(ALLOWED_TONES))}.",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )
    tone_style = raw_tone

    optional_ai_instructions = data.get("optional_ai_instructions", "") or ""
    if optional_ai_instructions is None:
        optional_ai_instructions = ""
    if not isinstance(optional_ai_instructions, str):
        return None, Response(
            {"error": "'optional_ai_instructions' must be a string."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    community_name: str | None = None
    community_description = ""

    if community_id not in (None, ""):
        if not user_can_use_community_ai(user, community_id):
            return None, Response(
                {"error": "You do not have permission to generate AI content for this community."},
                status=status.HTTP_403_FORBIDDEN,
            )
        community_name, community_description, err = _resolve_from_community_id(community_id)
        if err:
            return None, err
    else:
        cn = data.get("community_name")
        if not isinstance(cn, str) or not cn.strip():
            return None, Response(
                {
                    "error": "'community_id' is required, or provide legacy 'community_name' "
                    "(must not be a UUID).",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        community_name = cn.strip()
        if _looks_like_uuid(community_name):
            return None, Response(
                {
                    "error": "community_name must be the real community name, not an id. "
                    "Send community_id so the server can resolve the name.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        client_description = data.get("community_description")
        if client_description is None:
            client_description = data.get("community_context", "") or ""
        if not isinstance(client_description, str):
            return None, Response(
                {"error": "'community_description' / 'community_context' must be a string."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        community_description = client_description.strip()

        # Legacy: contribution_areas was required; still accept and fold into context for old clients.
        legacy_areas = data.get("contribution_areas")
        if isinstance(legacy_areas, str) and legacy_areas.strip():
            extra = legacy_areas.strip()
            community_description = (
                f"{community_description}\n\nOrganizer notes on focus areas: {extra}"
                if community_description
                else f"Organizer notes on focus areas: {extra}"
            )

    assert community_name is not None

    return {
        "community_name": community_name,
        "role_title": role_title,
        "community_description": community_description,
        "optional_ai_instructions": optional_ai_instructions.strip(),
        "tone_style": tone_style,
    }, None


def parse_enhance_text_request(data: dict, user) -> tuple[dict[str, str] | None, Response | None]:
    """Validate POST for AI text enhancement (vacancy writing assistant)."""
    if not isinstance(data, dict):
        return None, Response({"error": "Invalid JSON body."}, status=status.HTTP_400_BAD_REQUEST)

    community_id = data.get("community_id")
    if community_id in (None, ""):
        return None, Response(
            {"error": "'community_id' is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not user_can_use_community_ai(user, community_id):
        return None, Response(
            {"error": "You do not have permission to use AI tools for this community."},
            status=status.HTTP_403_FORBIDDEN,
        )

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

    return {"text": text.strip(), "action_type": action_type}, None
