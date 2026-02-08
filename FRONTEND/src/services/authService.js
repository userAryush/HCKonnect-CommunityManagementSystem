import apiClient from './apiClient';

const authService = {
    login: async (email, password) => {
        try {
            // Backend returns: { msg: "...", data: { token: { access: "...", refresh: "..." } } }
            const response = await apiClient.post('/accounts/login/', { email, password });

            const tokenData = response.data?.data?.token;

            if (tokenData?.access) {
                localStorage.setItem('access_token', tokenData.access);
                if (tokenData.refresh) {
                    localStorage.setItem('refresh_token', tokenData.refresh);
                }
                return response.data;
            }
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
    },

    getCurrentUser: async () => {
        try {
            // Using /accounts/profile/ as identified in urls.py
            const response = await apiClient.get('/accounts/profile/');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('access_token');
    }
};

export default authService;
