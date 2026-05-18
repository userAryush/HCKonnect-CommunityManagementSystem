import json
import os
import re

from django.conf import settings

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_google_genai.chat_models import ChatGoogleGenerativeAIError
from services.ai.prompts import (
    application_analysis_prompt,
    cover_letter_prompt,
    discussion_helper_prompt,
    event_field_generate_prompt,
    job_description_prompt,
    resume_improvement_prompt,
    text_enhancement_prompt,
    vacancy_description_prompt,
)
from services.ai.scoring import normalize_application_analysis


class ApplicationAnalysisJSONError(Exception):
    """Raised when the model output cannot be parsed as the expected analysis JSON."""


class GeminiService:
    
    _DEFAULT_MODEL_FALLBACKS: tuple[str, ...] = (
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-2.5-flash-lite",
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
    )

    def __init__(self, model: str | None = None) -> None:
        api_key = getattr(settings, "GOOGLE_API_KEY", None) or os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY is not configured in Django settings.")

        preferred_model = (
            model
            or getattr(settings, "GOOGLE_GEMINI_MODEL", None)
            or self._DEFAULT_MODEL_FALLBACKS[0]
        )
        self._model_candidates = [preferred_model, *self._DEFAULT_MODEL_FALLBACKS]
        # De-duplicate while preserving order
        self._model_candidates = list(dict.fromkeys(self._model_candidates))
        self._api_key = api_key
        self._llm = self._create_llm(self._model_candidates[0])

    def _create_llm(self, model: str) -> ChatGoogleGenerativeAI:
        return ChatGoogleGenerativeAI(
            model=model,
            google_api_key=self._api_key,
        )

    @staticmethod
    def _should_try_next_model(error_text: str) -> bool:
        """True when another model id might succeed (wrong model, quota, or access gate)."""
        t = error_text.lower()
        return (
            "not_found" in t
            or "not found" in t
            or "404" in t
            or "resource_exhausted" in t
            or "429" in t
            or "quota" in t
            or "permission_denied" in t
            or "403" in t
            or "denied access" in t
            or "invalid_argument" in t
            or "400" in t
            or "is not found for api version" in t
        )

    def generate_text(self, prompt: str) -> str:
        last_error = None
        for model_name in self._model_candidates:
            try:
                # Recreate llm each attempt so retries can switch model safely.
                self._llm = self._create_llm(model_name)
                response = self._llm.invoke(prompt)
                return (response.content or "").strip()
            except ChatGoogleGenerativeAIError as exc:
                last_error = exc
                if self._should_try_next_model(str(exc)):
                    continue
                raise
            except Exception as exc:
                # Newer google-genai stacks may surface non-langchain error types.
                last_error = exc
                if self._should_try_next_model(str(exc)):
                    continue
                raise
        if last_error:
            raise last_error
        raise RuntimeError("Failed to generate text from Gemini.")

    @staticmethod
    def _extract_profile_field(profile, key: str, fallback: str = "") -> str:
        if isinstance(profile, dict):
            value = profile.get(key)
            if value is None:
                return fallback
            return str(value)
        return fallback

    def generate_vacancy_description(
        self,
        *,
        community_name: str,
        role_title: str,
        community_description: str = "",
        optional_ai_instructions: str = "",
        tone_style: str = "friendly",
    ) -> str:
        prompt = vacancy_description_prompt(
            community_name=community_name,
            role_title=role_title,
            community_description=community_description,
            optional_ai_instructions=optional_ai_instructions,
            tone_style=tone_style,
        )
        return self.generate_text(prompt)

    def enhance_text(self, text: str, action_type: str, *, domain: str = "vacancy") -> str:
        """Rewrite existing copy (vacancy description or application message) according to action_type."""
        prompt = text_enhancement_prompt(action_type=action_type, text=text, domain=domain)
        return self.generate_text(prompt)

    def generate_event_copy(self, payload: dict[str, str]) -> str:
        """Generate event description or what-to-expect lines from validated context dict."""
        prompt = event_field_generate_prompt(**payload)
        return self.generate_text(prompt)

    def generate_job_description(
        self,
        community_name: str,
        member_role: str,
        contribution_areas: str,
        community_context: str = "",
    ) -> str:
        prompt = job_description_prompt(
            community_name=community_name,
            member_role=member_role,
            contribution_areas=contribution_areas,
            community_context=community_context,
        )
        return self.generate_text(prompt)

    def generate_cover_letter(
        self,
        profile,
        job_description: str,
        optional_ai_instructions: str = "",
    ) -> str:
        applicant_name = self._extract_profile_field(profile, "name", "Community Applicant")
        applicant_background = (
            self._extract_profile_field(profile, "background")
            or str(profile)
        )
        motivation = (
            self._extract_profile_field(profile, "motivation")
            or "I am motivated to contribute and grow with the community."
        )
        community_name = self._extract_profile_field(profile, "community_name", "Community")

        prompt = cover_letter_prompt(
            community_name=community_name,
            member_role=job_description,
            applicant_name=applicant_name,
            applicant_background=applicant_background,
            motivation=motivation,
            optional_ai_instructions=optional_ai_instructions or "",
        )
        return self.generate_text(prompt)

    def improve_resume(self, resume_text: str, job_description: str) -> str:
        prompt = resume_improvement_prompt(
            profile_text=resume_text,
            target_community_role=job_description,
            community_focus="",
        )
        return self.generate_text(prompt)

    def summarize_discussion(self, messages) -> str:
        if isinstance(messages, (list, tuple)):
            combined_messages = "\n".join(str(message) for message in messages)
        else:
            combined_messages = str(messages)

        summary_question = (
            "Summarize the following discussion into key points, decisions, and next steps:\n"
            f"{combined_messages}"
        )
        prompt = discussion_helper_prompt(
            community_name="Community",
            topic="Discussion Summary",
            user_question=summary_question,
        )
        return self.generate_text(prompt)

    @staticmethod
    def _strip_json_fences(raw: str) -> str:
        text = (raw or "").strip()
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
            text = re.sub(r"\s*```$", "", text)
        return text.strip()

    @staticmethod
    def _coerce_str_list(value, *, max_items: int = 8) -> list[str]:
        if value is None:
            return []
        if isinstance(value, str):
            return [value.strip()] if value.strip() else []
        if isinstance(value, (list, tuple)):
            out: list[str] = []
            for item in value[:max_items]:
                s = str(item).strip()
                if s:
                    out.append(s)
            return out
        return [str(value).strip()] if str(value).strip() else []

    def analyze_application(
        self,
        *,
        role_description: str,
        community_focus: str = "",
        resume_text: str,
        cover_letter: str,
    ) -> dict:
        """Penalty-based analysis: base_score, penalties, final_score, plus qualitative fields."""
        prompt = application_analysis_prompt(
            role_description=role_description,
            community_focus=community_focus or "",
            resume_text=resume_text,
            cover_letter=cover_letter,
        )
        raw = self.generate_text(prompt)
        text = self._strip_json_fences(raw)
        try:
            data = json.loads(text)
        except json.JSONDecodeError as exc:
            raise ApplicationAnalysisJSONError(
                "The AI returned a response that could not be read as JSON. Try again."
            ) from exc

        if not isinstance(data, dict):
            raise ApplicationAnalysisJSONError("AI response must be a JSON object.")

        return normalize_application_analysis(data)
