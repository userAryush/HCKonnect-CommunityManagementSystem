"""Shared limits for post and discussion comment / reply text."""

MAX_COMMENT_LENGTH = 1500


def validate_comment_length(value, field_name="Comment"):
    """Raise ValidationError if plain-text length exceeds the comment cap."""
    from rest_framework.exceptions import ValidationError

    if value is None:
        return value
    text = value if isinstance(value, str) else str(value)
    if len(text) > MAX_COMMENT_LENGTH:
        raise ValidationError(
            f"{field_name} must be at most {MAX_COMMENT_LENGTH} characters."
        )
    return value
