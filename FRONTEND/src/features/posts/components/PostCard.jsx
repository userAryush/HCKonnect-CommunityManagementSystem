import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pin } from 'lucide-react';
import postService from '../service/postService';
import Card from '../../../shared/components/card/Card';
import CardHeader from '../../../shared/components/card/CardHeader';
import CardActionMenu from '../../../shared/components/card/CardActionMenu';
import Badge from '../../../shared/components/ui/Badge';
import ActionButtons from '../../../shared/components/ui/ActionButtons';
import ConfirmationModal from '../../../shared/components/modals/ConfirmationModal';

export default function PostCard({ post, onDelete, isDetailView = false }) {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const [itemState, setItemState] = useState(post);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setItemState(post);
    }, [post]);

    const isAuthor = user && (String(user.id) === String(itemState.author));
    const isAdmin = user && user.role === 'admin';
    const canEdit = isAuthor;
    const canDelete = isAuthor || isAdmin;

    const handleDelete = (e) => {
        if (e) e.stopPropagation();
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            await postService.deletePost(itemState.id);
            setIsDeleteModalOpen(false);
            if (onDelete) onDelete(itemState.id);
            else navigate('/feed');
        } catch (error) {
            console.error("Failed to delete", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = (e) => {
        if (e) e.stopPropagation();
        navigate(`/posts/edit/${itemState.id}`);
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
        <>
            <Card
                onClick={isDetailView ? undefined : handleCardClick}
                className={`${isDetailView ? '' : 'cursor-pointer'} group relative`}
            >
                <CardHeader
                    item={itemState}
                    actions={
                        <CardActionMenu
                            canEdit={canEdit}
                            onEdit={handleEdit}
                            canDelete={canDelete}
                            onDelete={handleDelete}
                        />
                    }
                >
                    {itemState.is_pinned && (
                        <Pin size={14} className="text-primary fill-primary/10 p-0.5" />
                    )}
                    <Badge variant="deepBlue">Post</Badge>
                </CardHeader>

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

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete post?"
                message="This action cannot be undone."
                confirmText="Delete"
                isLoading={isDeleting}
                loadingText="Deleting..."
            />
        </>
    );
}
