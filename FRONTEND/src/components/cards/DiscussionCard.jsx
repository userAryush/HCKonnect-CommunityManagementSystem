import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit } from 'lucide-react';
import discussionService from '../../services/discussionService';
import { formatTimeAgo } from '../../utils/timeFormatter';
import { getInitials, getDisplayName, getRoleLabel, getProfileImage } from '../../utils/userUtils';
import Card from '../shared/Card';
import Badge from '../shared/Badge';
import ActionButtons from '../shared/ActionButtons';
import Dropdown from '../shared/Dropdown';

export default function DiscussionCard({ item, onDelete, isDetailView = false }) {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const [itemState, setItemState] = useState(item);

    useEffect(() => {
        setItemState(item);
    }, [item]);
    const isOwner = user && (String(user.id) === String(itemState.created_by));

    const isCommunityAdmin = user && item.community && (
        (user.role === 'community' && String(user.id) === String(item.community.id || item.community)) ||
        (user.membership && user.membership.role === 'representative' && String(user.membership.community) === String(item.community.id || item.community))
    );

    const canDelete = isOwner || isCommunityAdmin;

    const handleDelete = async (e) => {
        if (e) e.stopPropagation();
        if (window.confirm("Delete this discussion?")) {
            try {
                await discussionService.deleteDiscussion(item.id);
                if (onDelete) onDelete(item.id);
                else navigate('/discussions');
            } catch (error) {
                console.error("Failed to delete", error);
            }
        }
    };

    const handleCardClick = () => {
        if (isDetailView) return;
        navigate(`/discussions/${item.id}`);
    };

    return (
        <Card
            onClick={isDetailView ? undefined : handleCardClick}
            className={`${isDetailView ? '' : 'cursor-pointer'} group relative`}
        >
            <div className="flex items-center justify-between mb-4">
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
                                    ? `/community/${itemState.community}`
                                    : `/profile/${itemState.created_by}`;
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
                    <Badge variant="blue">Discussion</Badge>
                    {itemState.visibility && <Badge variant={itemState.visibility === 'public' ? 'success' : 'gray'}>{itemState.visibility}</Badge>}

                    {(canDelete) && (
                        <Dropdown
                            actions={[
                                {
                                    label: 'Edit',
                                    icon: <Edit size={14} />,
                                    onClick: () => {
                                        navigate(`/discussions/edit/${item.id}`);
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

            <div className="space-y-2">

                <h3 className={`text-title transition-transform duration-200 ease-out ${isDetailView ? 'text-2xl' : 'group-hover:-translate-y-0.5'}`}>
                    {itemState.topic}
                </h3>
                <p className={`text-body leading-relaxed ${isDetailView ? '' : 'line-clamp-2'}`}>
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
    );
}
