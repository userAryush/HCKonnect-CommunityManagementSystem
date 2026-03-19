import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../shared/Card';
import { getDisplayName, getInitials, getProfileImage, getRoleLabel } from '../../utils/userUtils';

export default function MiniProfileCard() {
    const { user } = useAuth();

    if (!user) return null;

    const displayName = getDisplayName(user);
    const profileImage = getProfileImage(user);
    const initials = getInitials(displayName);
    const roleLabel = getRoleLabel(user);

    const membership = user.membership;
    const isMember = !!membership;
    const communityName = membership?.community_name || membership?.community?.name;
    const communityLogo = membership?.community_logo || membership?.community?.community_logo;

    return (
        <Card className="flex flex-col items-center p-8">
            {/* Profile Image */}
            <div className="mb-4 relative">
                {profileImage ? (
                    <img
                        src={profileImage}
                        alt={displayName}
                        className="h-20 w-20 rounded-full object-cover ring-4 ring-zinc-50 border border-zinc-200"
                    />
                ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200">
                        <span className="text-xl font-bold uppercase tracking-wider">
                            {initials}
                        </span>
                    </div>
                )}
            </div>

            <div className="text-center">
                <Link
                    to="/profile"
                    className="text-title hover:text-primary transition-colors block"
                >
                    {displayName}
                </Link>
                <p className="text-metadata mt-1">
                    {roleLabel}
                </p>
            </div>

            {/* Membership */}
            {isMember && (
                <div className="mt-6 w-full pt-6 border-t border-surface-border/50">
                    <div className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                        {communityLogo ? (
                            <img
                                src={communityLogo}
                                alt={communityName}
                                className="h-5 w-5 rounded object-cover border border-zinc-200"
                            />
                        ) : (
                            <div className="h-5 w-5 rounded bg-white border border-zinc-200 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-zinc-400">
                                    {(communityName || 'C').charAt(0)}
                                </span>
                            </div>
                        )}
                        <p className="text-[11px] font-semibold text-zinc-600">
                            Member of <span className="text-primary">{communityName}</span>
                        </p>
                    </div>
                </div>
            )}
        </Card>
    );
}