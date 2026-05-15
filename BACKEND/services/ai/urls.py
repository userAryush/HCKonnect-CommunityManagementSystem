from django.urls import path

from services.ai.views import (
    AIApplicationAnalysisView,
    AIApplicationTextEnhanceView,
    AIEventGenerateView,
    AICoverLetterView,
    AIDiscussionSummaryView,
    AIJobDescriptionView,
    AIResumeImprovementView,
    AITextEnhanceView,
)

urlpatterns = [
    path("job-description/", AIJobDescriptionView.as_view(), name="ai-job-description"),
    path("text-enhance/", AITextEnhanceView.as_view(), name="ai-text-enhance"),
    path("application-analysis/", AIApplicationAnalysisView.as_view(), name="ai-application-analysis"),
    path("application-text-enhance/", AIApplicationTextEnhanceView.as_view(), name="ai-application-text-enhance"),
    path("event-generate/", AIEventGenerateView.as_view(), name="ai-event-generate"),
    path("cover-letter/", AICoverLetterView.as_view(), name="ai-cover-letter"),
    path("resume/", AIResumeImprovementView.as_view(), name="ai-resume"),
    path("discussion/", AIDiscussionSummaryView.as_view(), name="ai-discussion"),
]
