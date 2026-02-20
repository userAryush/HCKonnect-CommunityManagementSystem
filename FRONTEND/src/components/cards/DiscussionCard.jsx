import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ThumbsUp, Trash2 } from 'lucide-react';
import discussionService from '../../services/discussionService';
import CommunityAvatar from '../shared/CommunityAvatar';
import ActionButtons from '../shared/ActionButtons';
import { formatTimeAgo } from '../../utils/timeFormatter';

export default function DiscussionCard({ item, onDelete }) {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const [itemState, setItemState] = useState(item);
    const isOwner = user && (String(user.id) === String(itemState.created_by));

    // Check if user is admin of the community this discussion belongs to, if applicable.
    const isCommunityAdmin = user && item.community && (
        (user.role === 'community' && String(user.id) === String(item.community.id || item.community)) ||
        (user.membership && user.membership.role === 'representative' && String(user.membership.community) === String(item.community.id || item.community))
    );

    const canDelete = isOwner || isCommunityAdmin;

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (window.confirm("Delete this discussion?")) {
            try {
                await discussionService.deleteDiscussion(item.id);
                if (onDelete) onDelete(item.id);
                else window.location.reload();
            } catch (error) {
                console.error("Failed to delete", error);
                alert("Failed to delete discussion");
            }
        }
    };

    const handleCardClick = () => {
        navigate(`/discussions/${item.id}`);
    };

    return (
        <article
            onClick={handleCardClick}
            className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md cursor-pointer group"
        >
            <div className="flex items-start gap-4">
                {/* Avatar Section */}
                {item.community ? (
                    <CommunityAvatar name={item.community_name || item.community?.name || "Community"} />
                ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                        {item.created_by_name ? item.created_by_name[0].toUpperCase() : 'U'}
                    </div>
                )}

                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        {/* LEFT SIDE */}
                        <div>
                            <p className="text-xs font-medium text-gray-500">
                                Posted by{" "}
                                <span className="text-gray-900 font-semibold">
                                    {item.created_by_name || "User"}
                                </span>{" "}
                                • {formatTimeAgo(item.created_at || itemState.created_at)}
                            </p>
                        </div>

                        {/* RIGHT SIDE (same placement style as announcement card) */}
                        <div className="flex items-center gap-2">
                            <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                                Discussion
                            </span>

                            <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${itemState.visibility === "public"
                                    ? "bg-green-100 text-green-700 border-green-200"
                                    : "bg-gray-100 text-gray-600 border-gray-200"
                                    }`}
                            >
                                {itemState.visibility || "Public"}
                            </span>

                            {canDelete && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete();
                                    }}
                                    className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Delete Discussion"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    <h3 className="mt-3 text-lg font-bold text-gray-900 leading-tight group-hover:text-green-600 transition-colors">
                        {itemState.topic}
                    </h3>

                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {itemState.content}
                    </p>

                    <ActionButtons
                        item={itemState}
                        onReaction={() => {
                            const wasLiked = itemState.user_has_liked;
                            // Optimistic update
                            setItemState(prev => ({
                                ...prev,
                                user_has_liked: !wasLiked,
                                reaction_count: wasLiked ? Math.max(0, (prev.reaction_count || 0) - 1) : (prev.reaction_count || 0) + 1
                            }));

                            discussionService.toggleReaction({ topic: itemState.id })
                                .catch(err => {
                                    console.error(err);
                                    // Revert on error
                                    setItemState(item);
                                });
                        }}
                        onCommentClick={handleCardClick}
                    />
                </div>
            </div>
        </article>
    );
}
