import { useNavigate } from 'react-router-dom';
import { Trash2, Pin } from 'lucide-react';
import { useState } from 'react';
import postService from '../../services/postService';
import Card from '../shared/Card';
import Badge from '../shared/Badge';
import ActionButtons from '../shared/ActionButtons';
import { formatTimeAgo } from '../../utils/timeFormatter';
import { getInitials, getDisplayName, getRoleLabel, getProfileImage } from '../../utils/userUtils';

export default function PostCard({ post, onDelete }) {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const [itemState, setItemState] = useState(post);

    const isAuthor = user && (String(user.id) === String(itemState.author));
    const isAdmin = user && user.role === 'admin';
    const canDelete = isAuthor || isAdmin;

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (window.confirm("Delete this post?")) {
            try {
                await postService.deletePost(itemState.id);
                if (onDelete) onDelete(itemState.id);
            } catch (error) {
                console.error("Failed to delete", error);
            }
        }
    };

    const handleCardClick = () => {
        navigate(`/posts/${itemState.id}`);
    };

    const handleReaction = async () => {
        const wasLiked = itemState.user_has_liked;
        setItemState(prev => ({
            ...prev,
            user_has_liked: !wasLiked,
            reaction_count: wasLiked ? Math.max(0, (prev.reaction_count || 0) - 1) : (prev.reaction_count || 0) + 1
        }));

        try {
            await postService.toggleReaction({ post: itemState.id });
        } catch (error) {
            console.error(error);
            setItemState(post);
        }
    };

    return (
        <Card
            onClick={handleCardClick}
            className="cursor-pointer group relative"
        >
            <div className="flex justify-between items-center mb-4">
                <header className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold overflow-hidden border border-zinc-200 uppercase text-xs tracking-wider">
                        {getProfileImage(itemState) ? (
                            <img src={getProfileImage(itemState)} alt={getDisplayName(itemState)} className="h-full w-full object-cover" />
                        ) : (
                            <span>{getInitials(getDisplayName(itemState))}</span>
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-surface-dark">{getDisplayName(itemState)}</p>
                        <p className="text-metadata">
                            {getRoleLabel(itemState)} • {formatTimeAgo(itemState.created_at)}
                        </p>
                    </div>
                </header>

                <div className="flex items-center gap-2">
                    {itemState.is_pinned && (
                        <Pin size={14} className="text-primary fill-primary/10 p-0.5" />
                    )}
                    <Badge variant="gray">Post</Badge>
                    {canDelete && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete();
                            }}
                            className="text-zinc-400 hover:text-red-500 p-1.5 transition-colors rounded-full hover:bg-red-50"
                            title="Delete Post"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>

            <div className="text-body leading-relaxed whitespace-pre-wrap">
                {itemState.content}
            </div>

            {itemState.image && (
                <div className="mt-4 rounded-xl overflow-hidden bg-zinc-50 border border-surface-border/50">
                    <img
                        src={itemState.image}
                        alt="Post content"
                        className="w-full h-auto max-h-[500px] object-cover"
                    />
                </div>
            )}

            <ActionButtons
                item={itemState}
                onReaction={handleReaction}
                onCommentClick={handleCardClick}
            />
        </Card>
    );
}
