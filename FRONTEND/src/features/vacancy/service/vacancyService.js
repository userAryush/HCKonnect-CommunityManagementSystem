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
   * Get all vacancies. Can filter by community_id.
   * Students see only open ones. Communities see their own (even closed).
   */
  getVacancies: async (communityId = null, options = {}) => {
    const params = new URLSearchParams();
    if (communityId) params.set('community_id', communityId);
    if (options.status) params.set('status', options.status);
    if (options.sort) params.set('sort', options.sort);
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
