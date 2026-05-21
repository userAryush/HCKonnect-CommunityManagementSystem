import React from 'react';
import { Link } from 'react-router-dom';
import {
    getInitials,
    getDisplayName,
    getProfileImage,
    isCommunityAuthor,
} from '../../../utils/userUtils';

/**
 * Resolves profile vs community route — same rules for cards and comments.
 * @param {object|null} item
 * @returns {string|null}
 */
export function getUserNavigationPath(item) {
    if (!item) return null;
    const raw = item.author ?? item.created_by;
    const authorId =
        raw != null && typeof raw === 'object' && 'id' in raw ? raw.id : raw;
    const communityId = item.community?.id ?? item.community;

    if (item.author_role === 'community' && authorId != null && authorId !== '') {
        return `/community/${encodeURIComponent(String(authorId).trim())}`;
    }
    if (authorId != null && authorId !== '') {
        return `/profile/${encodeURIComponent(String(authorId).trim())}`;
    }
    if (communityId != null && communityId !== '') {
        return `/community/${encodeURIComponent(String(communityId).trim())}`;
    }
    return null;
}

const SIZE_CLASSES = {
    lg: 'h-16 w-16 text-lg tracking-wider',
    md: 'h-10 w-10 text-xs tracking-wider',
    sm: 'h-9 w-9 text-[11px] tracking-wide',
    xs: 'h-7 w-7 text-[10px] tracking-wide',
};

/** Community logos — same treatment as CommunitiesList (plain img, object-contain). */
const COMMUNITY_LOGO_IMG_CLASSES = {
    lg: 'h-12 w-auto max-w-[120px] flex-shrink-0 object-contain',
    md: 'h-8 w-auto max-w-[78px] flex-shrink-0 object-contain',
    sm: 'h-7 w-auto max-w-[70px] flex-shrink-0 object-contain',
    xs: 'h-6 w-auto max-w-[60px] flex-shrink-0 object-contain',
};

const COMMUNITY_LOGO_FALLBACK_CLASSES = {
    lg: 'flex h-14 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-surface-muted-bg text-sm font-bold text-surface-body',
    md: 'flex h-10 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-surface-muted-bg text-xs font-bold text-surface-body',
    sm: 'flex h-9 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-surface-muted-bg text-[11px] font-bold text-surface-body',
    xs: 'flex h-7 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-surface-muted-bg text-[10px] font-bold text-surface-body',
};

/** Avatar only — same image/initials logic as card headers. */
export function UserAvatar({ item, size = 'md', className = '' }) {
    const dim = SIZE_CLASSES[size] || SIZE_CLASSES.md;
    const displayName = getDisplayName(item);
    const image = getProfileImage(item);

    if (isCommunityAuthor(item)) {
        const imgClass = COMMUNITY_LOGO_IMG_CLASSES[size] || COMMUNITY_LOGO_IMG_CLASSES.md;
        const fallbackClass =
            COMMUNITY_LOGO_FALLBACK_CLASSES[size] || COMMUNITY_LOGO_FALLBACK_CLASSES.md;

        if (image) {
            return (
                <img
                    src={image}
                    alt={displayName}
                    className={`${imgClass} ${className}`.trim()}
                />
            );
        }

        return (
            <div className={`${fallbackClass} ${className}`.trim()}>
                <span className="truncate">{getInitials(displayName)}</span>
            </div>
        );
    }

    return (
        <div
            className={`${dim} rounded-full flex items-center justify-center font-bold overflow-hidden border uppercase bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-700 dark:text-zinc-200 dark:border-zinc-600 flex-shrink-0 ${className}`.trim()}
        >
            {image ? (
                <img src={image} alt={displayName} className="h-full w-full object-cover" />
            ) : (
                <span>{getInitials(displayName)}</span>
            )}
        </div>
    );
}

/** Display name with the same navigation behavior as the card UserInfo name click. */
export function UserProfileName({ item, className = '', children }) {
    const display = children ?? getDisplayName(item);
    const path = getUserNavigationPath(item);
    const base =
        'font-semibold text-surface-dark dark:text-[var(--surface-heading)] cursor-pointer transition-all duration-200 ease-out hover:font-bold';
    if (!path) {
        return <span className={`${base} ${className}`.trim()}>{display}</span>;
    }
    return (
        <Link to={path} className={`${base} ${className}`.trim()} onClick={(e) => e.stopPropagation()}>
            {display}
        </Link>
    );
}

const UserInfo = ({ item, secondaryText, size = 'md', className = '' }) => {
    return (
        <div className={`flex items-center gap-3 ${className}`.trim()}>
            <UserAvatar item={item} size={size} />
            <div>
                <UserProfileName item={item} className="text-sm" />
                {secondaryText && <p className="text-metadata">{secondaryText}</p>}
            </div>
        </div>
    );
};

export default UserInfo;
