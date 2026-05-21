/**
 * Extract a user-facing message from an API error response.
 */
export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
    const data = error?.response?.data;
    if (!data) return fallback;
    if (data instanceof Blob) return fallback;
    if (typeof data.detail === 'string') return data.detail;
    if (typeof data.error === 'string') return data.error;
    if (Array.isArray(data.detail) && data.detail[0]) {
        const first = data.detail[0];
        return typeof first === 'string' ? first : String(first);
    }
    return fallback;
}
