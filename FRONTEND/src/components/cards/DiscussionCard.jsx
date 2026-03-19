import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import discussionService from '../../services/discussionService';
import { formatTimeAgo } from '../../utils/timeFormatter';
import { getInitials, getDisplayName, getRoleLabel, getProfileImage } from '../../utils/userUtils';
import Card from '../shared/Card';
import Badge from '../shared/Badge';
import ActionButtons from '../shared/ActionButtons';

export default function DiscussionCard({ item, onDelete }) {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const [itemState, setItemState] = useState(item);
    const isOwner = user && (String(user.id) === String(itemState.created_by));

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
            }
        }
    };

    const handleCardClick = () => {
        navigate(`/discussions/${item.id}`);
    };

    return (
        <Card
            onClick={handleCardClick}
            className="cursor-pointer group relative"
        >
            <div className="flex items-center justify-between mb-4">
                <header className="flex items-center gap-3">
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 font-bold overflow-hidden border border-zinc-200 uppercase text-xs tracking-wider"
                        aria-hidden
                    >
                        {getProfileImage(item) ? (
                            <img src={getProfileImage(item)} alt={getDisplayName(item)} className="h-full w-full object-cover" />
                        ) : (
                            <span>{getInitials(getDisplayName(item))}</span>
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-surface-dark">{getDisplayName(item)}</p>
                        <p className="text-metadata">
                            {getRoleLabel(item)} • in <span className="text-primary font-medium">{item.community_name || "General"}</span> • {formatTimeAgo(item.created_at || itemState.created_at)}
                        </p>
                    </div>
                </header>

                <div className="flex items-center gap-2">
                    <Badge variant="gray">Discussion</Badge>
                    {itemState.visibility && <Badge variant={itemState.visibility === 'public' ? 'success' : 'gray'}>{itemState.visibility}</Badge>}
                    
                    {canDelete && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete();
                            }}
                            className="text-zinc-400 hover:text-red-500 p-1.5 transition-colors rounded-full hover:bg-red-50"
                            title="Delete Discussion"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-title group-hover:text-primary transition-colors">
                    {itemState.topic}
                </h3>
                <p className="text-body line-clamp-2 leading-relaxed">
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
            />
        </Card>
    );
}
