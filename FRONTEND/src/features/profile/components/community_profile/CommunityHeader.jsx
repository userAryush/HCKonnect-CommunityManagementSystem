import { Edit2, Mail } from 'lucide-react';
import SendMessageModal from '../../../../shared/components/modals/SendMessageModal';
import { isPlatformCommunity } from '../../../../utils/communityUtils';
import { getInitials } from '../../../../utils/userUtils';

export default function CommunityHeader({
    communityData,
    isProfileOwner,
    currentUser,
    isMessageModalOpen,
    setIsMessageModalOpen,
    onEditProfile,
}) {
    const platform = isPlatformCommunity(communityData);
    const logo = communityData.community_logo;
    const name = communityData.community_name;

    return (
        <header className="border-b border-surface-border/40 pb-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    {logo ? (
                        <img
                            src={logo}
                            alt={name}
                            className="h-24 w-auto max-w-[160px] flex-shrink-0 object-contain sm:h-24 sm:max-w-[160px]"
                        />
                    ) : (
                        <div className="flex h-24 w-36 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                            <span className="font-display text-3xl font-bold text-primary">
                                {getInitials(name || 'Community')}
                            </span>
                        </div>
                    )}

                    <div className="text-center sm:text-left mt-1">
                        <h1 className="text-2xl font-bold text-surface-dark">
                            {communityData.community_name}
                        </h1>
                        {!platform && (
                            <div className="mt-3 flex items-center justify-center sm:justify-start gap-3">
                                <span className="text-xs font-medium text-surface-muted">
                                    {Number(communityData.member_count || 0).toLocaleString()} members
                                </span>
                            </div>
                        )}
                        {platform && (
                            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-primary">
                                Official Platform Organization
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap justify-center sm:justify-end gap-3">
                    {isProfileOwner === true && (
                        <button
                            type="button"
                            onClick={onEditProfile}
                            className="flex items-center gap-2 rounded-xl border border-surface-border/70 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-surface-dark transition hover:bg-secondary hover:border-surface-border"
                        >
                            <Edit2 size={16} className="text-primary" />
                            <span>Edit Profile</span>
                        </button>
                    )}

                    {isProfileOwner === false && currentUser && (
                        <button
                            onClick={() => setIsMessageModalOpen(true)}
                            className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary/10"
                        >
                            <Mail size={16} />
                            <span>Send Email to {name}</span>
                        </button>
                    )}
                </div>
            </div>

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
