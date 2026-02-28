import apiClient from './apiClient';

const notificationService = {
    /**
     * Fetch all notifications for the current user
     */
    getNotifications: async () => {
        try {
            const response = await apiClient.get('/notifications/');
            return response.data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    },

    /**
     * Mark a single notification as read
     */
    markAsRead: async (id) => {
        try {
            const response = await apiClient.patch(`/notifications/${id}/read/`);
            return response.data;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    /**
     * Mark all notifications as read
     */
    markAllAsRead: async () => {
        try {
            const response = await apiClient.patch('/notifications/mark-all-read/');
            return response.data;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    },

    /**
     * Soft delete a notification
     */
    deleteNotification: async (id) => {
        try {
            const response = await apiClient.delete(`/notifications/${id}/delete/`);
            return response.data;
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }
};

export default notificationService;
