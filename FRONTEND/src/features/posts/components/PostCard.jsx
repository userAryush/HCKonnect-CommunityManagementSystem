import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import postService from '../service/postService';
import Card from '../../../shared/components/ui/Card';
import Badge from '../../../shared/components/ui/Badge';
import ActionButtons from '../../../shared/components/ui/ActionButtons';
import Dropdown from '../../../shared/components/ui/Dropdown';
import { Edit, Trash2, Pin } from 'lucide-react';
import { formatTimeAgo } from '../../../utils/timeFormatter';
import { getInitials, getDisplayName, getRoleLabel, getProfileImage } from '../../../utils/userUtils';

export default function PostCard({ post, onDelete, isDetailView = false }) {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const [itemState, setItemState] = useState(post);

    useEffect(() => {
        setItemState(post);
    }, [post]);

    const isAuthor = user && (String(user.id) === String(itemState.author));
    const isAdmin = user && user.role === 'admin';
    const canDelete = isAuthor || isAdmin;

    const handleDelete = async (e) => {
        if (e) e.stopPropagation();
        if (window.confirm("Delete this post?")) {
            try {
                await postService.deletePost(itemState.id);
                if (onDelete) onDelete(itemState.id);
                else navigate('/feed');
            } catch (error) {
                console.error("Failed to delete", error);
            }
        }
    };

    const handleCardClick = () => {
        if (isDetailView) return;
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
            onClick={isDetailView ? undefined : handleCardClick}
            className={`${isDetailView ? '' : 'cursor-pointer'} group relative`}
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
                        <p
                            className="text-sm font-semibold text-surface-dark cursor-pointer transition-all duration-200 ease-out hover:font-bold"

                            onClick={(e) => {
                                e.stopPropagation();
                                const route = itemState.author_role === 'community'
                                    ? `/community/${itemState.author}`
                                    : `/profile/${itemState.author}`;
                                navigate(route);
                            }}
                        >
                            {getDisplayName(itemState)}
                        </p>
                        <p className="text-metadata">
                            {getRoleLabel(itemState)} • {formatTimeAgo(itemState.created_at)}
                        </p>
                    </div>
                </header>

                <div className="flex items-center gap-2">
                    {itemState.is_pinned && (
                        <Pin size={14} className="text-primary fill-primary/10 p-0.5" />
                    )}
                    <Badge variant="deepBlue">Post</Badge>
                    {canDelete && (
                        <Dropdown
                            actions={[
                                {
                                    label: 'Edit',
                                    icon: <Edit size={14} />,
                                    onClick: () => {
                                        navigate(`/posts/edit/${itemState.id}`);
                                    }
                                },
                                {
                                    label: 'Delete',
                                    icon: <Trash2 size={14} />,
                                    onClick: handleDelete,
                                    variant: 'danger'
                                }
                            ]}
                        />
                    )}
                </div>
            </div>

            <div className={`text-body leading-relaxed whitespace-pre-wrap ${isDetailView ? 'text-lg' : ''}`}>
                {itemState.content}
            </div>

            {itemState.image && (
                <div className={`mt-4 rounded-xl overflow-hidden bg-zinc-50 border border-surface-border/50 ${isDetailView ? '-mx-6 rounded-none' : 'aspect-video'}`}>
                    <img
                        src={itemState.image}
                        alt="Post content"
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            <ActionButtons
                item={itemState}
                onReaction={handleReaction}
                onCommentClick={handleCardClick}
                type="post"
            />
        </Card>
    );
}
