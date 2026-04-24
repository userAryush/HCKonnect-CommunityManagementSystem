import React from 'react';
import { ThumbsUp, MessageSquare, Share2 } from 'lucide-react';
import Button from './Button';
import ShareButton from '../card/ShareButton';
import { getContentShareUrl } from '../../../utils/shareUtils';

export default function ActionButtons({
    item,
    onReaction,
    onCommentClick,
    showShare = true,
    type = 'post' // 'post' or 'discussion'
}) {
    const shareUrl = getContentShareUrl(type, item.id);
    const isLiked = item.user_has_liked;
    const reactionCount = item.reaction_count || 0;
    const commentCount = item.comment_count || item.reply_count || 0;

    return (
        <div className="flex items-center gap-3 border-t border-surface-border pt-4 mt-6">
            <Button
                variant="secondary"
                onClick={(e) => {
                    e.stopPropagation();
                    onReaction();
                }}
                className={`rounded-full px-4 py-1.5 !text-xs gap-2 ${isLiked ? 'border-primary text-primary bg-primary/5' : ''}`}
            >
                <ThumbsUp
                    size={14}
                    className={`${isLiked ? "fill-primary" : "text-zinc-400"} transition-all`}
                />
                <span>{reactionCount}</span>
            </Button>

            <Button
                variant="secondary"
                onClick={(e) => {
                    e.stopPropagation();
                    if (onCommentClick) onCommentClick();
                }}
                className="rounded-full px-4 py-1.5 !text-xs gap-2"
            >
                <MessageSquare size={14} className="text-zinc-400" />
                <span>{commentCount}</span>
            </Button>

            {showShare && (
                <ShareButton
                    variant="secondary"
                    url={shareUrl}
                    title={item.topic || item.title || 'Shared from HCKonnect'}
                    text="Take a look at this on HCKonnect."
                    className="rounded-full px-4 py-1.5 !text-xs gap-2 ml-auto"
                >
                    <Share2 size={14} className="text-zinc-400" />
                    <span className="hidden sm:inline">Share</span>
                </ShareButton>
            )}
        </div>
    );
}
