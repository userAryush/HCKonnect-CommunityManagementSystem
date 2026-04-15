import apiClient from './apiClient';

const authService = {
    register: async (payload) => {
        try {
            const response = await apiClient.post('/accounts/register/', payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

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

    googleLogin: async (token, tokenType = 'access_token') => {
        try {
            const payload = tokenType === 'id_token'
                ? { id_token: token }
                : { access_token: token };

            const response = await apiClient.post('/accounts/google/', payload);
            const data = response.data;

            if (data?.access) {
                localStorage.setItem('access_token', data.access);
                if (data.refresh) {
                    localStorage.setItem('refresh_token', data.refresh);
                }
            }
            return data;
        } catch (error) {
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
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
    },

    changePassword: async (old_password, new_password) => {
        try {
            const response = await apiClient.post('/accounts/change-password/', { old_password, new_password });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default authService;
