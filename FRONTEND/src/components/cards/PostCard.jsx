import { useNavigate } from 'react-router-dom';
import { Trash2, Pin } from 'lucide-react';
import { useState } from 'react';
import postService from '../../services/postService';
import ActionButtons from '../shared/ActionButtons';

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
                alert("Failed to delete post");
            }
        }
    };

    const handleCardClick = () => {
        navigate(`/posts/${itemState.id}`);
    };

    const handleReaction = async () => {
        const wasLiked = itemState.user_has_liked;
        // Optimistic update
        setItemState(prev => ({
            ...prev,
            user_has_liked: !wasLiked,
            reaction_count: wasLiked ? Math.max(0, (prev.reaction_count || 0) - 1) : (prev.reaction_count || 0) + 1
        }));

        try {
            await postService.toggleReaction({ post: itemState.id });
        } catch (error) {
            console.error(error);
            // Revert on error
            setItemState(post);
        }
    };

    return (
        <article
            onClick={handleCardClick}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6 transition hover:shadow-md cursor-pointer group"
        >
            <div className="p-5">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {itemState.author_name ? itemState.author_name[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="font-bold text-gray-900 leading-none">{itemState.author_name || 'User'}</p>
                                {itemState.is_pinned && (
                                    <Pin size={14} className="text-blue-500 fill-blue-500" />
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-gray-500">{itemState.time_ago}</p>
                            </div>
                        </div>
                    </div>


                    {/* <div className="flex items-center gap-2">
                        {canDelete && (
                            <button
                                onClick={handleDelete}
                                className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div> */}
                    <div className="flex items-center gap-2">
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
                        <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                            Post
                        </span>

                    </div>
                </div>

                {/* Content */}
                <div className="mt-4">
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {itemState.content}
                    </p>
                </div>
            </div>

            {/* Optional Image */}
            {itemState.image && (
                <div className="mt-2 w-full max-h-[500px] overflow-hidden bg-gray-100">
                    <img
                        src={itemState.image}
                        alt="Post content"
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            <div className="px-5 pb-2">
                <ActionButtons
                    item={itemState}
                    onReaction={handleReaction}
                    onCommentClick={handleCardClick}
                    activeColor="green"
                />
            </div>
        </article>
    );
}
