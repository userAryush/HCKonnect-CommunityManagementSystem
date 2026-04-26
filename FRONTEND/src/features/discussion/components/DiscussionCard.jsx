import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import discussionService from '../service/discussionService';
import Card from '../../../shared/components/card/Card';
import CardHeader from '../../../shared/components/card/CardHeader';
import CardActionMenu from '../../../shared/components/card/CardActionMenu';
import Badge from '../../../shared/components/ui/Badge';
import ActionButtons from '../../../shared/components/ui/ActionButtons';
import ConfirmationModal from '../../../shared/components/modals/ConfirmationModal';

export default function DiscussionCard({ item, onDelete, isDetailView = false }) {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const [itemState, setItemState] = useState(item);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setItemState(item);
    }, [item]);

    const isOwner = user && (String(user.id) === String(itemState.created_by));
    const isCommunityAdmin = user && item.community && (
        (user.role === 'community' && String(user.id) === String(item.community.id || item.community)) ||
        (user.membership && user.membership.role === 'representative' && String(user.membership.community) === String(item.community.id || item.community))
    );

    const canEdit = isOwner;
    const canDelete = isOwner || isCommunityAdmin;

    const handleDelete = (e) => {
        if (e) e.stopPropagation();
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            await discussionService.deleteDiscussion(item.id);
            setIsDeleteModalOpen(false);
            if (onDelete) onDelete(item.id);
            else navigate('/discussions');
        } catch (error) {
            console.error("Failed to delete", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = (e) => {
        if (e) e.stopPropagation();
        navigate(`/discussions/edit/${item.id}`);
    };

    const handleCardClick = () => {
        if (isDetailView) return;
        navigate(`/discussions/${item.id}`);
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
                    <Badge variant="blue">Discussion</Badge>
                    {itemState.visibility && <Badge variant={itemState.visibility === 'public' ? 'success' : 'gray'}>{itemState.visibility}</Badge>}
                </CardHeader>

                <div className="space-y-2">
                    <h3 className={`text-title !text-[var(--surface-heading)] transition-transform duration-200 ease-out ${isDetailView ? 'text-2xl' : 'group-hover:-translate-y-0.5'}`}>
                        {itemState.topic}
                    </h3>
                    <p className={`text-body !text-[var(--app-text)] leading-relaxed ${isDetailView ? '' : 'line-clamp-2'}`}>
                        {itemState.content}
                    </p>
                </div>

                <ActionButtons
                    item={itemState}
                    onReaction={() => {
                        const wasLiked = itemState.user_has_liked;
                        setItemState(prev => ({
                            ...prev,
                            user_has_liked: !wasLiked,
                            reaction_count: wasLiked ? Math.max(0, (prev.reaction_count || 0) - 1) : (prev.reaction_count || 0) + 1
                        }));

                        discussionService.toggleReaction({ topic: itemState.id })
                            .catch(err => {
                                console.error(err);
                                setItemState(item);
                            });
                    }}
                    onCommentClick={handleCardClick}
                    type="discussion"
                />
            </Card>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete discussion?"
                message="This action cannot be undone."
                confirmText="Delete"
                isLoading={isDeleting}
                loadingText="Deleting..."
            />
        </>
    );
}
