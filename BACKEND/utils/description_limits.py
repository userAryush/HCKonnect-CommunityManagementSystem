"""Shared limits for user-facing description / body text fields."""

MAX_DESCRIPTION_LENGTH = 3000
RESOURCE_DESCRIPTION_MAX_LENGTH = 1500


def validate_description_length(value, field_name="Description", max_length=MAX_DESCRIPTION_LENGTH):
    """Raise ValidationError if plain-text length exceeds the platform cap."""
    from rest_framework.exceptions import ValidationError

    if value is None:
        return value
    text = value if isinstance(value, str) else str(value)
    if len(text) > max_length:
        raise ValidationError(
            f"{field_name} must be at most {max_length} characters."
        )
    return value


def validate_resource_description_length(value, field_name="Description"):
    return validate_description_length(
        value, field_name=field_name, max_length=RESOURCE_DESCRIPTION_MAX_LENGTH
    )
