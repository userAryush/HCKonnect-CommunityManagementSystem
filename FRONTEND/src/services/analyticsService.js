import apiClient from './apiClient';

const analyticsService = {
  getCommunityAnalytics: async (communityId) => {
    try {
      const response = await apiClient.get(`/communities/analytics/${communityId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching community analytics:', error);
      throw error;
    }
  }
};

export default analyticsService;
