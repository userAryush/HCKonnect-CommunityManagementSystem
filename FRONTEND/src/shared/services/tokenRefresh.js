import axios from 'axios';
import { getJwtExpiryMs } from '../utils/jwtUtils';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/';

const REFRESH_URL = '/accounts/token/refresh/';
const LOGOUT_URL = '/accounts/logout/';

/** Plain axios — must not use apiClient (avoids interceptor loops). */
const refreshClient = axios.create({
    baseURL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

export function clearStoredTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
}

/**
 * Exchange refresh token (HttpOnly cookie and/or legacy localStorage) for a new access token.
 */
export async function refreshAccessToken() {
    const legacyRefresh = localStorage.getItem('refresh_token');
    const body = legacyRefresh ? { refresh: legacyRefresh } : {};

    const response = await refreshClient.post(REFRESH_URL, body);
    const access = response.data?.access;

    if (!access) {
        throw new Error('Refresh response did not include an access token');
    }

    localStorage.setItem('access_token', access);
    return access;
}

export async function logoutOnServer() {
    try {
        await refreshClient.post(LOGOUT_URL);
    } catch {
        // Best-effort — local session is cleared regardless.
    }
}

/**
 * Schedule a proactive refresh ~1 minute before access token expiry.
 * Returns a cleanup function.
 */
export function scheduleSilentRefresh(onRefresh, onFailure) {
    const accessToken = localStorage.getItem('access_token');
    const expMs = getJwtExpiryMs(accessToken);

    if (!expMs) return () => {};

    const refreshInMs = Math.max(expMs - Date.now() - 60_000, 5_000);

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
