import axios from 'axios';
import { getJwtExpiryMs } from '../utils/jwtUtils'; // reads token expirey time

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/';

const REFRESH_URL = '/accounts/token/refresh/';
const LOGOUT_URL = '/accounts/logout/';

// .
const refreshClient = axios.create({
    baseURL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

// Deletes stored JWT tokens from browser memory when logout, token expired, auth failure
export function clearStoredTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
}

// get a new access token using refresh token
export async function refreshAccessToken() {
    const legacyRefresh = localStorage.getItem('refresh_token');
    const body = legacyRefresh ? { refresh: legacyRefresh } : {};

    // calling refresh api
    const response = await refreshClient.post(REFRESH_URL, body);
    // get new access token from response
    const access = response.data?.access;

    if (!access) {
        throw new Error('Refresh response did not include an access token');
    }

    localStorage.setItem('access_token', access);
    return access;
}

//calls backend logout api
export async function logoutOnServer() {
    try {
        await refreshClient.post(LOGOUT_URL);
    } catch {
        // even if backend logout fails, local session is cleared so ignore
    }
}

// Automatically refresh token BEFORE it expires (without user interaction)
export function scheduleSilentRefresh(onRefresh, onFailure) {
    const accessToken = localStorage.getItem('access_token');
    const expMs = getJwtExpiryMs(accessToken);  // reads jwt payload(exp) 

    if (!expMs) return () => {}; // if token invalid, do nothin
    // calc refresh time
    const refreshInMs = Math.max(expMs - Date.now() - 60_000, 5_000);
    // schedule automatic refresh
    const timerId = setTimeout(async () => {
        try {
            await refreshAccessToken();
            onRefresh?.();
            scheduleSilentRefresh(onRefresh, onFailure);
        } catch (error) {
            onFailure?.(error);
        }
    }, refreshInMs);

    return () => clearTimeout(timerId);
}

// to check if req is related to auth, used for interceptors to tell do not attach token donot refresh token for auth endpoints
export function isAuthEndpoint(url = '') {
    if (!url) return false;
    const path = url.replace(baseURL, '');
    return (
        path.includes('/accounts/login/')
        || path.includes('/accounts/register/')
        || path.includes('/accounts/google/')
        || path.includes('/accounts/token/refresh/')
        || path.includes('/accounts/forgot-password/')
        || path.includes('/accounts/verify-otp/')
        || path.includes('/accounts/reset-password/')
        || path.includes('/accounts/logout/')
    );
}
