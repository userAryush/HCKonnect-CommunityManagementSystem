import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../authentication/components/AuthContext';
import { getDisplayName, getInitials, getProfileImage, getRoleLabel } from '../../../utils/userUtils';

export default function MiniProfileCard({ profile: profileProp = null, isFeedLoading = false }) {
    const { user } = useAuth();

    if (!user) return null;

    const displayName = getDisplayName(user);
    const profileImage = getProfileImage(user);
    const initials = getInitials(displayName);
    const roleLabel = getRoleLabel(user);

    const statItems = useMemo(() => {
        const sidebar = profileProp?.feed_sidebar_stats;
        if (sidebar?.is_community_account) {
            return [
                { num: sidebar.posts ?? '—', lbl: 'Posts' },
                { num: sidebar.members_count ?? '—', lbl: 'Members' },
                { num: sidebar.upcoming_events ?? '—', lbl: 'Next Events' },
            ];
        }
        if (sidebar) {
            return [
                { num: sidebar.posts ?? '—', lbl: 'Posts' },
                { num: sidebar.registered_events_count ?? '—', lbl: 'Event Attended' },
                { num: sidebar.discussions ?? '—', lbl: 'Discussions' },
            ];
        }
        return [
            { num: user.posts_count ?? '—', lbl: 'Posts' },
            { num: user.events_count ?? '—', lbl: 'Event Attended' },
            { num: user.discussions_count ?? '—', lbl: 'Discussions' },
        ];
    }, [profileProp, user.discussions_count, user.events_count, user.posts_count]);

    return (
        <div className="rounded-standard relative overflow-hidden border border-primary/30 bg-primary/[0.07]">
            <div className="relative p-6 flex flex-col items-center">
                <div className="mb-3">
                    {profileImage ? (
                        <img
                            src={profileImage}
                            alt={displayName}
                            className="h-16 w-16 rounded-full object-cover border-[2.5px] border-primary shadow-sm" />
                    ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border-[2.5px] border-primary bg-white">
                            <span className="text-lg font-bold uppercase tracking-wider text-primary-hover">
                                {initials}
                            </span>
                        </div>
                    )}
                </div>

                <div className="text-center">
                    <Link
                        to="/profile"
                        className="block text-[15px] tracking-[-0.01em] font-semibold text-surface-dark transition-opacity hover:opacity-70">
                        {displayName}
                    </Link>
                    <p className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-primary-hover">
                        {roleLabel}
                    </p>
                </div>

                <div className="mt-5 w-full grid grid-cols-3 gap-2">
                    {statItems.map(({ num, lbl }) => (
                        <div key={lbl} className="flex flex-col items-center rounded-xl border border-primary/25 bg-white py-2">
                            <span className="text-[15px] font-bold text-primary-hover">
                                {isFeedLoading ? '…' : num}
                            </span>
                            <span className="text-[9px] uppercase tracking-[0.07em] text-primary">{lbl}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
