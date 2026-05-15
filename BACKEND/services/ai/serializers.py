from rest_framework import serializers


class ApplicationAnalysisSerializer(serializers.Serializer):
    """Validate POST body for AI application analysis."""

    role_description = serializers.CharField(
        max_length=100_000,
        trim_whitespace=True,
        help_text="Vacancy / role description text.",
    )
    community_focus = serializers.CharField(
        max_length=100_000,
        allow_blank=True,
        required=False,
        default="",
        trim_whitespace=True,
        help_text="Community mission / focus text (optional).",
    )
    resume_text = serializers.CharField(
        max_length=100_000,
        trim_whitespace=True,
        help_text="Plain-text resume content.",
    )
    cover_letter = serializers.CharField(
        max_length=100_000,
        trim_whitespace=True,
        help_text="Cover letter / application message.",
    )
