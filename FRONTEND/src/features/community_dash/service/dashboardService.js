import apiClient from '../../../shared/services/apiClient';

const dashboardService = {
  /**
   * Consolidated dashboard payload (dashboard, analytics, events, stats, announcements, vacancies).
   */
  getSummary: async (communityId) => {
    const response = await apiClient.get(`/communities/${communityId}/summary/`);
    return response.data;
  },
};

export default dashboardService;
