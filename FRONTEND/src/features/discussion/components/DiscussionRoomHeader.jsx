import { ArrowLeft, Clock3, Hash, MessageSquare, ThumbsUp } from 'lucide-react';
import { UserAvatar, UserProfileName } from '../../../shared/components/card/UserInfo';
import { formatTimeAgo } from '../../../utils/timeFormatter';
import { getRoleLabel } from '../../../utils/userUtils';

export default function DiscussionRoomHeader({
    discussion,
    replyCount = 0,
    onToggleTopicReaction,
    onBack,
    onTitleClick,
}) {
    if (!discussion) return null;

    const createdAt = discussion.created_at || discussion.createdAt;
    const reactionCount = discussion.reaction_count || 0;
    const isLiked = Boolean(discussion.user_has_liked);

    return (
        <section className="fixed top-0 left-0 right-0 z-20 border-b border-surface-border bg-[var(--surface-card)]/95 backdrop-blur-sm shadow-sm">
            <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 gap-6">

                {/* Left Section: Navigation, Hash, and Title */}
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                    <button
                        type="button"
                        onClick={onBack}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-surface-border text-[var(--surface-muted-text)] hover:bg-[var(--surface-muted-bg)] hover:text-[var(--surface-heading)] transition"
                        aria-label="Back"
                    >
                        <ArrowLeft size={16} />
                    </button>

                    <div className="shrink-0 rounded-md bg-[var(--surface-muted-bg)] p-1.5 text-[var(--surface-muted-text)]">
                        <Hash size={14} />
                    </div>

                    <button
                        type="button"
                        onClick={onTitleClick}
                        className="min-w-0 max-w-full text-left truncate"
                        title="Jump to topic description"
                    >
                        <h1 className="truncate text-sm md:text-base font-semibold text-[var(--surface-heading)] hover:cursor-pointer">
                            {discussion.topic}
                        </h1>
                    </button>
                </div>

                {/* Right Section: Metadata & Author Info */}
                <div className="flex shrink-0 items-center gap-3">
                    
                    {/* Metadata Pills (Desktop-friendly) */}
                    <div className="hidden sm:flex items-center gap-1.5 text-[11px]">
                        <button
                            type="button"
                            onClick={onToggleTopicReaction}
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 transition-all ${
                                isLiked
                                    ? 'border-primary/40 bg-primary/10 text-primary font-medium'
                                    : 'border-surface-border text-[var(--surface-muted-text)] hover:text-[var(--surface-heading)] hover:bg-[var(--surface-muted-bg)]'
                            }`}
                        >
                            <ThumbsUp size={12} className={isLiked ? 'fill-primary' : ''} />
                            <span>{reactionCount}</span>
                        </button>

                        <span className="inline-flex items-center gap-1 rounded-full border border-surface-border px-2 py-1 text-[var(--surface-muted-text)] bg-[var(--surface-card)]">
                            <MessageSquare size={12} />
                            <span>{replyCount}</span>
                        </span>

                        {createdAt && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-surface-border px-2 py-1 text-[var(--surface-muted-text)] bg-[var(--surface-card)]">
                                <Clock3 size={12} />
                                <span>{formatTimeAgo(createdAt)}</span>
                            </span>
                        )}
                    </div>

                    <div className="h-6 w-px shrink-0 bg-surface-border mx-1 hidden sm:block" />

                    {/* Author Section */}
                    <div className="flex items-center gap-3">
                        <UserAvatar item={discussion} size="xs" />
                        <div className="hidden sm:block">
                            <UserProfileName item={discussion} className="text-xs font-semibold text-[var(--surface-heading)]" />
                            <p className="text-[10px] text-[var(--surface-muted-text)]">
                                {getRoleLabel(discussion)}
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}