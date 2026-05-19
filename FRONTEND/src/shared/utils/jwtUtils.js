/**
 * Client-side JWT payload helpers (scheduling only — not for verification).
 */

export function getJwtExpiryMs(token) {
    if (!token || typeof token !== 'string') return null;
    try {
        const payload = token.split('.')[1];
        if (!payload) return null;
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = JSON.parse(atob(base64));
        if (!decoded.exp) return null;
        return decoded.exp * 1000;
    } catch {
        return null;
    }
}

/** True when the token is missing, malformed, or within `bufferMs` of expiry. */
export function isTokenExpired(token, bufferMs = 60_000) {
    const expMs = getJwtExpiryMs(token);
    if (!expMs) return true;
    return Date.now() >= expMs - bufferMs;
}
