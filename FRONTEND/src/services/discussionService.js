import apiClient from './apiClient';

const discussionService = {
    // Get list of discussions
    getDiscussions: async (page = 1, communityId = null) => {
        try {
            let url = `/discussions/list/?page=${page}`;
            if (communityId) {
                url += `&community_id=${communityId}`;
            }
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get single discussion detail
    getDiscussion: async (id) => {
        try {
            const response = await apiClient.get(`/discussions/discussion-detail/${id}/`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Create a new discussion
    createDiscussion: async (data) => {
        try {
            const response = await apiClient.post('/discussions/create/', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update a discussion
    updateDiscussion: async (id, data) => {
        try {
            const response = await apiClient.patch(`/discussions/${id}/update/`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Delete a discussion
    deleteDiscussion: async (id) => {
        try {
            const response = await apiClient.delete(`/discussions/${id}/delete/`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Create a reply
    createReply: async (data) => {
        try {
            const response = await apiClient.post('/discussions/replies/create/', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get paginated replies for a topic
    getReplies: async (topicId, page = 1) => {
        try {
            const response = await apiClient.get(`/discussions/replies/list/?topic_id=${topicId}&page=${page}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update a reply
    updateReply: async (id, data) => {
        try {
            const response = await apiClient.patch(`/discussions/replies/${id}/update/`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Delete a reply
    deleteReply: async (id) => {
        try {
            const response = await apiClient.delete(`/discussions/replies/${id}/delete/`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Toggle reaction
    toggleReaction: async (data) => {
        try {
            const response = await apiClient.post('/discussions/reactions/', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default discussionService;
