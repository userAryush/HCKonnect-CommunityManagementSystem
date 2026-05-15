import apiClient from '../../../shared/services/apiClient';

const eventService = {
    getEvents: async (communityId = null, page = 1, pageSize = 20) => {
        try {
            let url = `/events/event-list/?page=${page}&page_size=${pageSize}`;
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

    /** AI rewrite for event description or expectation draft. domain: event_description | event_expectations */
    enhanceEventText: async ({ text, action_type, domain }) => {
        const response = await apiClient.post('/api/ai/application-text-enhance/', {
            text,
            action_type,
            domain,
        });
        return response.data;
    },

    /**
     * AI draft from context. target: description | what_to_expect
     * Optional: date, start_time, end_time, format, location, description, existing_expectations, optional_ai_instructions
     */
    generateEventCopy: async (payload) => {
        const response = await apiClient.post('/api/ai/event-generate/', payload);
        return response.data;
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
    },

    // New Registration and Participant Management Methods
    registerForEvent: async (id) => {
        try {
            const response = await apiClient.post(`/events/${id}/register/`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    unregisterFromEvent: async (id) => {
        try {
            const response = await apiClient.delete(`/events/${id}/register/`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getParticipants: async (eventId, page = 1, pageSize = 100) => {
        try {
            const response = await apiClient.get(`/events/${eventId}/participants/?page=${page}&page_size=${pageSize}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateAttendance: async (registrationId, attendance) => {
        try {
            const response = await apiClient.patch(`/events/registrations/${registrationId}/attendance/`, { attendance });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    manualAddParticipant: async (eventId, email) => {
        try {
            const response = await apiClient.post(`/events/${eventId}/add-participant/`, { email });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default eventService;
