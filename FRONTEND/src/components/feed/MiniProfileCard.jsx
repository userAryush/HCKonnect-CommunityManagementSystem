import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function MiniProfileCard() {
    const { user } = useAuth();

    if (!user) return null;

    // 1. Correctly derive variables
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || user.email;
    const initial = (fullName || 'U').charAt(0).toUpperCase();

    // Mapping the role correctly
    const roleLabel = user.role === 'student' ? 'Student' : (user.role === 'community' ? 'Community Admin' : 'Admin');

    // Membership info handling
    const membership = user.membership;
    const isMember = !!membership;
    const communityName = membership?.community_name || membership?.community?.name;
    const communityLogo = membership?.community_logo || membership?.community?.community_logo;

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm mb-6 text-center">
            {/* Profile Image */}
            <div className="flex justify-center mb-3">
                {user.profile_image ? (
                    <img
                        src={user.profile_image}
                        alt={fullName}
                        className="h-20 w-20 rounded-full object-cover border-2 border-gray-50 shadow-sm"
                    />
                ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#75C043] text-2xl font-bold text-white shadow-sm">
                        {initial}
                    </div>
                )}
            </div>

            {/* Name */}
            <Link to="/profile" className="block text-lg font-bold text-gray-900 hover:text-[#75C043] transition-colors">
                {fullName}
            </Link>

            {/* Role or Membership Status */}
            <div className="mt-2 flex flex-col items-center gap-2">
                {isMember ? (
                    <div className="flex flex-col items-center">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                            {roleLabel}
                        </span>
                        <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                            {communityLogo && (
                                <img
                                    src={communityLogo}
                                    alt={communityName}
                                    className="w-5 h-5 rounded-sm object-contain"
                                />
                            )}
                            <span className="text-sm font-medium text-green-700">
                                Member of {communityName}
                            </span>
                        </div>
                    </div>
                ) : (
                    <span className="text-gray-500 text-sm font-medium italic">
                        {roleLabel}
                    </span>
                )}
            </div>
        </div>
    );
}