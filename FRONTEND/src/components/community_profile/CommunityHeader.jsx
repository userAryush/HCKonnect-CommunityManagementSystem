import { Link } from 'react-router-dom';
import { Edit2, Mail } from 'lucide-react';
import SendMessageModal from '../modals/SendMessageModal';

export default function CommunityHeader({
    communityData,
    isProfileOwner,
    currentUser,
    membershipStatus,
    handleJoinRequest,
    isMessageModalOpen,
    setIsMessageModalOpen,
}) {
    return (
        <header className="rounded-2xl border border-gray-200 bg-white p-8 overflow-hidden">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

                    {communityData.community_logo ? (
                        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white overflow-hidden">
                            <img
                                src={communityData.community_logo}
                                alt={communityData.community_name}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-surface-dark text-white text-2xl font-bold">
                            {communityData.community_name.slice(0, 2).toUpperCase()}
                        </div>
                    )}

                    {/* Info */}
                    <div className="text-center sm:text-left mt-1">
                        <h1 className="text-2xl font-bold text-surface-dark">
                            {communityData.community_name}
                        </h1>
                        <div className="mt-3 flex items-center justify-center sm:justify-start gap-3">
                            <span className="text-xs font-medium text-surface-muted">
                                {Number(communityData.member_count || 0).toLocaleString()} members
                            </span>

                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap justify-center sm:justify-end gap-3">
                    {(isProfileOwner === true) && (
                        <Link
                            to={`/profile/edit/${communityData.id}`}
                            className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-bold text-surface-dark transition hover:bg-zinc-50 hover:border-zinc-300"
                        >
                            <Edit2 size={16} className="text-primary" />
                            <span>Edit Profile</span>
                        </Link>
                    )}

                    {/* Send Message Button */}
                    {(isProfileOwner === false) && currentUser && (
                        <button
                            onClick={() => setIsMessageModalOpen(true)}
                            className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary/10"
                        >
                            <Mail size={16} />
                            <span>Send Email to {communityData.community_name}</span>
                        </button>
                    )}

                    {communityData.vacanciesOpen && (
                        <button
                            onClick={handleJoinRequest}
                            disabled={membershipStatus === 'pending'}
                            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${membershipStatus === 'pending'
                                ? 'bg-gray-50 border border-gray-200 text-surface-muted cursor-not-allowed'
                                : 'bg-primary text-white hover:bg-primary/90'
                                }`}
                        >
                            {membershipStatus === 'pending' ? 'Request Sent' : 'Request to Join'}
                        </button>
                    )}
                </div>
            </div>

            {/* Send Message Modal Integration */}
            <SendMessageModal
                isOpen={isMessageModalOpen}
                onClose={() => setIsMessageModalOpen(false)}
                communityName={communityData.community_name}
                communityEmail={communityData.email}
                senderEmail={currentUser?.email}
                communityId={communityData.id}
            />
        </header>
    );
}