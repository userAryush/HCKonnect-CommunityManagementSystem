/**
 * Standardizes time formatting for the application.
 * @param {string | Date} dateValue - The date string or object to format.
 * @returns {string} - A human-readable relative time string (e.g., "2h ago").
 */
export const formatTimeAgo = (dateValue) => {
    if (!dateValue) return '';

    const now = new Date();
    const past = new Date(dateValue);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) {
        return 'Just now';
    }

    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours}h ago`;
    }

    const days = Math.floor(hours / 24);
    if (days < 7) {
        return `${days}d ago`;
    }

    // Calculate months first to handle the edge case
    const months = Math.floor(days / 30);
    if (months >= 1) {
        if (months < 12) {
            return `${months}mo ago`;
        }
        const years = Math.floor(days / 365);
        return `${years}y ago`;
    }

    // Fallback to weeks if less than a month
    const weeks = Math.floor(days / 7);
    return `${weeks}w ago`;
};

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Stable calendar-day key for grouping (local timezone).
 */
export function getCalendarDayKey(dateValue) {
    if (!dateValue) return 'unknown';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return 'unknown';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/**
 * Calendar-day label for date separators (Today, Yesterday, or e.g. "2 May").
 */
export function formatReplyDateGroupLabel(dateValue) {
    if (!dateValue) return 'Earlier';

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return 'Earlier';

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (startOfDay.getTime() === startOfToday.getTime()) return 'Today';
    if (startOfDay.getTime() === startOfYesterday.getTime()) return 'Yesterday';

    const day = date.getDate();
    const month = MONTH_SHORT[date.getMonth()];
    if (date.getFullYear() !== now.getFullYear()) {
        return `${day} ${month} ${date.getFullYear()}`;
    }
    return `${day} ${month}`;
}

/** Group replies in display order by calendar day (one separator per day). */
export function groupRepliesByDate(replies) {
    if (!replies?.length) return [];

    const groups = [];
    let current = null;

    for (const reply of replies) {
        const raw = reply?.created_at ?? reply?.createdAt;
        const dateKey = getCalendarDayKey(raw);

        if (!current || current.dateKey !== dateKey) {
            current = {
                dateKey,
                label: formatReplyDateGroupLabel(raw),
                comments: [],
            };
            groups.push(current);
        }
        current.comments.push(reply);
    }

    return groups;
}
