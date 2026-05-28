import axios from 'axios';
import {
    refreshAccessToken,
    clearStoredTokens,
    isAuthEndpoint,
} from './tokenRefresh';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/', // baseurl so that every service just the main url instead of full url
    withCredentials: true, // for sending httponly cookie auto on requests to /acc/token/refresh/
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false; //tracks refresh already in progress
let failedQueue = []; // holds req that failed with 401 while refresh is happening

// once refresh is done, either retries with new token else rejects all if refresh failed
const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token);
    });
    failedQueue = [];
};

const redirectToLogin = () => {
    clearStoredTokens();
    if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
    }
};

// Request interceptor: reads access token from localstorage, attaches it as bearer header automatically
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// Response interceptor: silent refresh on 401, then retry
apiClient.interceptors.response.use(
    (response) => response, //success, just return it
    async (error) => {
        const originalRequest = error.config;

        if (!error.response || error.response.status !== 401) {
            return Promise.reject(error);
        }

        //avoids infinite loops: _retry -> prevents same req retried twice
        if (!originalRequest || originalRequest._retry || isAuthEndpoint(originalRequest.url)) {
            return Promise.reject(error);
        }
        // if refresh is in progress, queue the request and wait
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return apiClient(originalRequest);
            });
        }

        // does the refresh
        originalRequest._retry = true;
        isRefreshing = true;
        // Calls refreshAccessToken() from tokenRefresh.js
        // On success -> retries everything
        // On failure -> clears tokens, redirects to /login
        try {
            const newAccessToken = await refreshAccessToken();
            processQueue(null, newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            redirectToLogin();
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    },
);

export default apiClient;
