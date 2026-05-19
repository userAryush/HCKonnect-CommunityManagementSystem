from django.conf import settings


def hckonnect_globals(request):
    return {
        "FRONTEND_URL": settings.FRONTEND_URL or "http://localhost:5173/",
    }
