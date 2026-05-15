from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from services.ai.application_text import parse_application_text_enhance_request
from services.ai.event_ai import parse_event_generate_request
from services.ai.gemini_service import ApplicationAnalysisJSONError, GeminiService
from services.ai.serializers import ApplicationAnalysisSerializer
from services.ai.vacancy_description import parse_enhance_text_request, parse_vacancy_ai_request


def _required_string(data, field_name: str):
    value = data.get(field_name)
    if not isinstance(value, str) or not value.strip():
        return None, Response(
            {"error": f"'{field_name}' is required and must be a non-empty string."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    return value.strip(), None


def _safe_ai_call(callback):
    try:
        return callback(), None
    except ValueError as exc:
        return None, Response(
            {"error": str(exc)},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    except Exception as exc:
        return None, Response(
            {"error": f"AI service is temporarily unavailable. {str(exc)}"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )


class AIJobDescriptionView(APIView):
    def post(self, request, *args, **kwargs):
        payload, parse_error = parse_vacancy_ai_request(request.data, request.user)
        if parse_error:
            return parse_error

        response_text, service_error = _safe_ai_call(
            lambda: GeminiService().generate_vacancy_description(**payload)
        )
        if service_error:
            return service_error
        return Response({"response": response_text}, status=status.HTTP_200_OK)


class AITextEnhanceView(APIView):
    """Rewrite existing vacancy (or similar) text—used by the AI writing assistant."""

    def post(self, request, *args, **kwargs):
        payload, parse_error = parse_enhance_text_request(request.data, request.user)
        if parse_error:
            return parse_error

        response_text, service_error = _safe_ai_call(
            lambda: GeminiService().enhance_text(
                text=payload["text"],
                action_type=payload["action_type"],
                domain="vacancy",
            )
        )
        if service_error:
            return service_error
        return Response({"response": response_text}, status=status.HTTP_200_OK)


class AIApplicationAnalysisView(APIView):
    """
    Compare resume + cover letter to a role description (community fit, not hiring prediction).
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ApplicationAnalysisSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        payload = serializer.validated_data
        try:
            result = GeminiService().analyze_application(
                role_description=payload["role_description"],
                community_focus=payload.get("community_focus") or "",
                resume_text=payload["resume_text"],
                cover_letter=payload["cover_letter"],
            )
        except ApplicationAnalysisJSONError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as exc:
            return Response(
                {"error": f"AI service is temporarily unavailable. {str(exc)}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response(result, status=status.HTTP_200_OK)


class AIApplicationTextEnhanceView(APIView):
    """Authenticated users: polish short-form writing (applications, discussions, event fields)."""

    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        payload, parse_error = parse_application_text_enhance_request(request.data, request.user)
        if parse_error:
            return parse_error

        response_text, service_error = _safe_ai_call(
            lambda: GeminiService().enhance_text(
                text=payload["text"],
                action_type=payload["action_type"],
                domain=payload.get("domain", "application"),
            )
        )
        if service_error:
            return service_error
        return Response({"response": response_text}, status=status.HTTP_200_OK)


class AIEventGenerateView(APIView):
    """Authenticated users: draft event description or what-to-expect lines from event context."""

    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        payload, parse_error = parse_event_generate_request(request.data, request.user)
        if parse_error:
            return parse_error

        response_text, service_error = _safe_ai_call(
            lambda: GeminiService().generate_event_copy(payload)
        )
        if service_error:
            return service_error
        return Response({"response": response_text}, status=status.HTTP_200_OK)


class AICoverLetterView(APIView):
    def post(self, request, *args, **kwargs):
        profile = request.data.get("profile")
        if not isinstance(profile, (dict, str)):
            return Response(
                {"error": "'profile' is required and must be an object or string."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        job_description, error = _required_string(request.data, "job_description")
        if error:
            return error

        raw_opt = request.data.get("optional_ai_instructions", "")
        if raw_opt is None:
            raw_opt = ""
        if not isinstance(raw_opt, str):
            return Response(
                {"error": "'optional_ai_instructions' must be a string."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        response_text, service_error = _safe_ai_call(
            lambda: GeminiService().generate_cover_letter(
                profile=profile,
                job_description=job_description,
                optional_ai_instructions=raw_opt.strip(),
            )
        )
        if service_error:
            return service_error
        return Response({"response": response_text}, status=status.HTTP_200_OK)


class AIResumeImprovementView(APIView):
    def post(self, request, *args, **kwargs):
        resume_text, error = _required_string(request.data, "resume_text")
        if error:
            return error
        job_description, error = _required_string(request.data, "job_description")
        if error:
            return error

        response_text, service_error = _safe_ai_call(
            lambda: GeminiService().improve_resume(
                resume_text=resume_text,
                job_description=job_description,
            )
        )
        if service_error:
            return service_error
        return Response({"response": response_text}, status=status.HTTP_200_OK)


class AIDiscussionSummaryView(APIView):
    def post(self, request, *args, **kwargs):
        messages = request.data.get("messages")
        if not isinstance(messages, (list, tuple, str)) or (
            isinstance(messages, (list, tuple)) and len(messages) == 0
        ):
            return Response(
                {"error": "'messages' is required and must be a non-empty list or string."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        response_text, service_error = _safe_ai_call(
            lambda: GeminiService().summarize_discussion(messages=messages)
        )
        if service_error:
            return service_error
        return Response({"response": response_text}, status=status.HTTP_200_OK)
