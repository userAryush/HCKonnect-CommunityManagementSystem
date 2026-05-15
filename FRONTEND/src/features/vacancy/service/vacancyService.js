import apiClient from '../../../shared/services/apiClient';

const vacancyService = {
  /**
   * Create a new vacancy for a community
   */
  createVacancy: async (data) => {
    const response = await apiClient.post('/communities/vacancies/create/', data);
    return response.data;
  },

  /**
   * Generate vacancy description with AI.
   * Body: community_id, role_title, optional_ai_instructions?, tone?
   * Legacy: community_name, member_role, contribution_areas?, community_context (no community_id).
   */
  generateJobDescription: async (data) => {
    const response = await apiClient.post('/api/ai/job-description/', data);
    return response.data;
  },

  /**
   * AI writing assistant — rewrite current description.
   * Body: community_id, text, action_type (improve|professional|academic|friendly|grammar|concise|expand|engaging)
   */
  enhanceVacancyText: async (data) => {
    const response = await apiClient.post('/api/ai/text-enhance/', data);
    return response.data;
  },

  /**
   * Get all vacancies. Can filter by community_id.
   * Students see only open ones. Communities see their own (even closed).
   */
  getVacancies: async (communityId = null, options = {}) => {
    const params = new URLSearchParams();
    if (communityId) params.set('community_id', communityId);
    if (options.status) params.set('status', options.status);
    if (options.sort) params.set('sort', options.sort);
    if (options.page) params.set('page', options.page);
    if (options.pageSize) params.set('page_size', options.pageSize);
    const query = params.toString();
    const url = `/communities/vacancies/${query ? `?${query}` : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  /**
   * Get a specific vacancy (for managing)
   */
  getVacancy: async (vacancyId) => {
    const response = await apiClient.get(`/communities/vacancies/${vacancyId}/`);
    return response.data;
  },

  /** Public read-by-id (student detail page). */
  getVacancyPublic: async (vacancyId) => {
    const response = await apiClient.get(`/communities/vacancies/browse/${vacancyId}/`);
    return response.data;
  },

  /** AI cover letter draft. Body: profile (object), job_description, optional_ai_instructions? */
  generateCoverLetter: async (data) => {
    const response = await apiClient.post('/api/ai/cover-letter/', data);
    return response.data;
  },

  /** AI assist on application message. Body: text, action_type */
  enhanceApplicationText: async (data) => {
    const response = await apiClient.post('/api/ai/application-text-enhance/', data);
    return response.data;
  },

  /**
   * AI application analysis vs role + community context.
   * Body: role_description, community_focus?, resume_text, cover_letter
   * Returns: base_score, penalties[{kind,reason,deduction}], final_score, match_score (mirror),
   * strengths, improvement_areas, missing_skills_or_traits, suggestions, overall_summary
   */
  analyzeApplication: async (data) => {
    const response = await apiClient.post('/api/ai/application-analysis/', data);
    return response.data;
  },

  /**
   * Update a vacancy (e.g., close it)
   */
  updateVacancy: async (vacancyId, data) => {
    const response = await apiClient.patch(`/communities/vacancies/${vacancyId}/`, data);
    return response.data;
  },

  /**
   * Apply for a vacancy
   * Data should be FormData if it includes a file
   */
  applyToVacancy: async (formData) => {
    const response = await apiClient.post('/communities/vacancies/apply/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get all applications for a vacancy (admin/owner only)
   */
  getApplicants: async (vacancyId = null) => {
    const url = vacancyId 
      ? `/communities/vacancies/applications/?vacancy_id=${vacancyId}` 
      : '/communities/vacancies/applications/';
    const response = await apiClient.get(url);
    return response.data;
  },
};

export default vacancyService;
