import apiClient from '../../../shared/services/apiClient';

const announcementService = {
    getAnnouncements: async (pageOrOptions = 1, legacyCommunityId = null) => {
        try {
            const options = typeof pageOrOptions === 'object'
                ? pageOrOptions
                : { page: pageOrOptions, communityId: legacyCommunityId };
            const page = options.page ?? 1;
            const pageSize = options.pageSize ?? 20;
            const communityId = options.communityId ?? null;

            let url = `/contents/announcements/?page=${page}&page_size=${pageSize}`;
            if (communityId) {
                url += `&community_id=${communityId}`;
            }
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getAnnouncementStats: async (communityId = null) => {
        try {
            let url = '/contents/announcements/stats/';
            if (communityId) {
                url += `?community_id=${communityId}`;
            }
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    createAnnouncement: async (formData) => {
        // formData should be FormData object for file upload
        try {
            const response = await apiClient.post('/contents/announcements/create/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateAnnouncement: async (id, data) => {
        try {
            const response = await apiClient.patch(`/contents/announcements/${id}/update/`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteAnnouncement: async (id) => {
        try {
            const response = await apiClient.delete(`/contents/announcements/${id}/delete/`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default announcementService;
