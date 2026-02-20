import { ThumbsUp, MessageSquare, Share2 } from 'lucide-react';

export default function ActionButtons({
    item,
    onReaction,
    onCommentClick,
    activeColor = "green",
    showShare = true
}) {
    const isLiked = item.user_has_liked;
    const reactionCount = item.reaction_count || 0;
    const commentCount = item.comment_count || item.reply_count || 0;

    const activeTextClass = activeColor === "green" ? "text-green-600" : "text-blue-600";
    const activeFillClass = activeColor === "green" ? "fill-green-600" : "fill-blue-600";
    const hoverClass = activeColor === "green" ? "hover:text-green-700" : "hover:text-blue-700";

    return (
        <div className="flex items-center gap-6 border-t border-gray-100 pt-3 mt-4">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onReaction();
                }}
                className={`flex items-center gap-1.5 text-sm transition font-bold ${isLiked ? activeTextClass : `text-gray-500 ${hoverClass}`}`}
            >
                <ThumbsUp
                    size={18}
                    className={`${isLiked ? `${activeTextClass} ${activeFillClass}` : ''} transition-all`}
                />
                <span>{reactionCount} Likes</span>
            </button>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    if (onCommentClick) onCommentClick();
                }}
                className="flex items-center gap-1.5 text-gray-500 text-sm font-bold hover:text-gray-700 transition"
            >
                <MessageSquare size={18} />
                <span>{commentCount} Comments</span>
            </button>

            {showShare && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        // Share logic could be added here
                    }}
                    className="flex items-center gap-1.5 text-gray-500 text-sm font-bold hover:text-gray-700 transition"
                >
                    <Share2 size={18} />
                    <span>Share</span>
                </button>
            )}
        </div>
    );
}
