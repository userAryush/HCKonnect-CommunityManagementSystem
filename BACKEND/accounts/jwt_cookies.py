"""HttpOnly cookie helpers for JWT refresh tokens."""

from django.conf import settings

REFRESH_TOKEN_COOKIE_NAME = 'hck_refresh_token'
REFRESH_TOKEN_COOKIE_PATH = '/accounts/token/refresh/'


def get_refresh_cookie_max_age() -> int:
    return int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds())


def set_refresh_cookie(response, refresh_token: str) -> None:
    response.set_cookie(
        REFRESH_TOKEN_COOKIE_NAME,
        refresh_token,
        max_age=get_refresh_cookie_max_age(),
        httponly=True,
        secure=getattr(settings, 'JWT_COOKIE_SECURE', not settings.DEBUG),
        samesite='Lax',
        path=REFRESH_TOKEN_COOKIE_PATH,
    )


def clear_refresh_cookie(response) -> None:
    response.delete_cookie(
        REFRESH_TOKEN_COOKIE_NAME,
        path=REFRESH_TOKEN_COOKIE_PATH,
    )
