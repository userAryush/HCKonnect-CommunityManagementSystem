import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Reply } from 'lucide-react';
import discussionService from '../service/discussionService';
import Navbar from '../../../shared/components/layout/Navbar';
import DiscussionCard from '../components/DiscussionCard';
import CommentSection from '../../../shared/components/ui/CommentSection';

export default function DiscussionDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [discussion, setDiscussion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [replies, setReplies] = useState([]);
    const [replyPage, setReplyPage] = useState(1);
    const [hasMoreReplies, setHasMoreReplies] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'
    const [replyingTo, setReplyingTo] = useState(null); // ID of reply we are replying to

    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        fetchDiscussion();
    }, [id]);

    const fetchDiscussion = async () => {
        setLoading(true);
        try {
            const data = await discussionService.getDiscussion(id);
            setDiscussion(data);
            setReplies(data.replies || []);
            setReplyPage(1);
            // If we got exactly 10 replies, there might be more (backend limit is 10)
            setHasMoreReplies(data.replies?.length === 10);
        } catch (error) {
            console.error("Failed to fetch discussion", error);
        } finally {
            setLoading(false);
        }
    };

    const loadMoreReplies = async () => {
        if (loadingMore || !hasMoreReplies) return;
        setLoadingMore(true);
        try {
            const nextPage = replyPage + 1;
            const data = await discussionService.getReplies(id, nextPage);
            setReplies(prev => [...prev, ...data.results]);
            setReplyPage(nextPage);
            setHasMoreReplies(!!data.next);
        } catch (error) {
            console.error("Failed to load more replies", error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handlePostReply = async (parentId = null, content = '') => {
        if (!content.trim()) return;

        setSubmitting(true);
        try {
            await discussionService.createReply({
                topic: id,
                parent_reply: parentId,
                reply_content: content
            });
            if (!parentId) {
                // Scroll to bottom after a delay to allow list to render
                setTimeout(() => {
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }, 500);
            }
            setReplyingTo(null);
            fetchDiscussion();
        } catch (error) {
            console.error("Failed to post reply", error);
            alert("Failed to post reply.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteReply = async (replyId) => {
        if (!window.confirm("Delete this reply?")) return;
        try {
            await discussionService.deleteReply(replyId);
            fetchDiscussion();
        } catch (error) {
            console.error("Failed to delete reply", error);
        }
    };

    const handleReaction = async (replyId = null) => {
        try {
            const payload = {};
            if (replyId) {
                payload.reply = replyId;
            } else {
                payload.topic = id;
            }

            // Optimistic update
            if (replyId) {
                setReplies(prev => {
                    const updateReplies = (repliesList) => repliesList.map(r => {
                        if (r.id === replyId) {
                            return {
                                ...r,
                                user_has_liked: !r.user_has_liked,
                                reaction_count: r.user_has_liked ? Math.max(0, (r.reaction_count || 0) - 1) : (r.reaction_count || 0) + 1
                            };
                        }
                        return r;
                    });
                    return updateReplies(prev);
                });
            } else {
                setDiscussion(prev => ({
                    ...prev,
                    user_has_liked: !prev.user_has_liked,
                    reaction_count: prev.user_has_liked ? Math.max(0, prev.reaction_count - 1) : prev.reaction_count + 1
                }));
            }

            await discussionService.toggleReaction(payload);
            // Optional: fetchDiscussion() to sync with server, but optimistic should feel better
        } catch (error) {
            console.error("Failed to react", error);
            fetchDiscussion(); // Revert on error
        }
    };

    const handleDeleteDiscussion = async () => {
        if (window.confirm("Delete this discussion?")) {
            try {
                await discussionService.deleteDiscussion(id);
                navigate('/discussions');
            } catch (error) {
                console.error("Failed to delete discussion", error);
                alert("Failed to delete discussion");
            }
        }
    };



    if (loading) {
        return (
            <div className="min-h-screen bg-secondary flex flex-col pt-20">
                <Navbar navSolid={true} />
                <div className="flex-1 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-green-600"></div>
                </div>
            </div>
        );
    }

    if (!discussion) return null;

    const isOwner = currentUser && String(currentUser.id) === String(discussion.created_by);

    return (
        <div className="min-h-screen bg-secondary flex flex-col pt-16">
            <Navbar navSolid={true} />
            <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">

                {/* Modern Back Button */}
                <button
                    onClick={() => navigate('/discussions')}
                    className="mb-6 flex items-center gap-2 text-surface-muted hover:text-surface-dark font-semibold text-sm transition px-2 py-1 rounded-lg hover:bg-zinc-100/60"
                >
                    <Reply size={16} className="rotate-180" /> Back to Feed
                </button>

                {/* Unified Card Component */}
                <div className="mb-10">
                    <DiscussionCard
                        item={discussion}
                        isDetailView={true}
                        onDelete={() => navigate('/discussions')}
                    />
                </div>

                <CommentSection
                    comments={replies}
                    onPostComment={handlePostReply}
                    onDeleteComment={handleDeleteReply}
                    onToggleReaction={handleReaction}
                    currentUser={currentUser}
                    submitting={submitting}
                    hasMore={hasMoreReplies}
                    onLoadMore={loadMoreReplies}
                    loadingMore={loadingMore}
                />

            </main>
        </div>
    );
}
