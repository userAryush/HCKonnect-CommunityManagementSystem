import apiClient from '../../../shared/services/apiClient';
import { refreshAccessToken, logoutOnServer, clearStoredTokens } from '../../../shared/services/tokenRefresh';
import { isTokenExpired } from '../../../shared/utils/jwtUtils';

const storeAccessToken = (access) => {
    if (access) {
        localStorage.setItem('access_token', access);
    }
};

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
            const response = await apiClient.post('/accounts/login/', { email, password });
            const tokenData = response.data?.data?.token;

            if (tokenData?.access) {
                storeAccessToken(tokenData.access);
                // Refresh token is stored in an HttpOnly cookie by the backend.
                localStorage.removeItem('refresh_token');
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
                storeAccessToken(data.access);
                localStorage.removeItem('refresh_token');
            }
            return data;
        } catch (error) {
            throw error;
        }
    },

    logout: async () => {
        await logoutOnServer();
        clearStoredTokens();
    },

    ensureValidAccessToken: async () => {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) return false;
        if (!isTokenExpired(accessToken)) return true;

        try {
            await refreshAccessToken();
            return true;
        } catch {
            clearStoredTokens();
            return false;
        }
    },

    getCurrentUser: async () => {
        try {
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
    },
};

export default authService;
