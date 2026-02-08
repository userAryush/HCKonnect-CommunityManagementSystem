import apiClient from './apiClient';

const eventService = {
    getEvents: async (communityId = null, page = 1) => {
        try {
            let url = `/events/event-list/?page=${page}`;
            if (communityId) {
                url += `&community_id=${communityId}`;
            }
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getEventStats: async (communityId = null) => {
        try {
            let url = '/events/stats/';
            if (communityId) {
                url += `?community_id=${communityId}`;
            }
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getEvent: async (id) => {
        try {
            const response = await apiClient.get(`/events/event/${id}/`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    createEvent: async (eventData) => {
        try {
            const config = {};
            if (eventData instanceof FormData) {
                config.headers = { 'Content-Type': 'multipart/form-data' };
            }
            const response = await apiClient.post('/events/event-create/', eventData, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateEvent: async (id, eventData) => {
        try {
            const config = {};
            if (eventData instanceof FormData) {
                config.headers = { 'Content-Type': 'multipart/form-data' };
            }
            const response = await apiClient.put(`/events/${id}/update/`, eventData, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteEvent: async (id) => {
        try {
            const response = await apiClient.delete(`/events/${id}/delete/`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default eventService;
