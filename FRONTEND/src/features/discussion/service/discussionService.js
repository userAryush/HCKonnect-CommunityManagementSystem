import apiClient from '../../../shared/services/apiClient';

const discussionService = {
    // Get list of discussions
    getDiscussions: async (pageOrOptions = 1, legacyCommunityId = null) => {
        try {
            const options = typeof pageOrOptions === 'object'
                ? pageOrOptions
                : { page: pageOrOptions, communityId: legacyCommunityId };
            const page = options.page ?? 1;
            const pageSize = options.pageSize ?? 20;
            const communityId = options.communityId ?? null;

            let url = `/discussions/list/?page=${page}&page_size=${pageSize}`;
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

    /** Cursor-based top-level replies: { comments, next_cursor, has_more } */
    getReplies: async (topicId, { cursor = null, limit = 14 } = {}) => {
        try {
            const params = new URLSearchParams();
            params.set('topic_id', topicId);
            params.set('limit', String(limit));
            if (cursor) params.set('cursor', cursor);
            const response = await apiClient.get(`/discussions/replies/list/?${params.toString()}`);
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
