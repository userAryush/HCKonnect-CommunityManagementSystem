import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, ThumbsUp, Trash2, Reply, CornerDownRight, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import discussionService from '../../services/discussionService';
import Navbar from '../../components/Navbar';
import CommunityAvatar from '../../components/shared/CommunityAvatar';
import ActionButtons from '../../components/shared/ActionButtons';
import CommentSection from '../../components/shared/CommentSection';

export default function DiscussionDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [discussion, setDiscussion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
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
        } catch (error) {
            console.error("Failed to fetch discussion", error);
        } finally {
            setLoading(false);
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
                setDiscussion(prev => {
                    const updateReplies = (replies) => replies.map(r => {
                        if (r.id === replyId) {
                            return {
                                ...r,
                                user_has_liked: !r.user_has_liked,
                                reaction_count: r.user_has_liked ? Math.max(0, (r.reaction_count || 0) - 1) : (r.reaction_count || 0) + 1
                            };
                        }
                        return r;
                    });
                    return { ...prev, replies: updateReplies(prev.replies) };
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
            <div className="min-h-screen bg-gray-50 flex flex-col pt-20">
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
        <div className="min-h-screen bg-gray-50 flex flex-col pt-16">
            <Navbar navSolid={true} />
            <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">

                {/* Modern Back Button */}
                <button
                    onClick={() => navigate('/discussions')}
                    className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-900 font-semibold text-sm transition px-2 py-1 rounded-lg hover:bg-gray-100"
                >
                    <Reply size={16} className="rotate-180" /> Back to Feed
                </button>

                {/* Main Topic Header */}
                <article className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-10 relative group">
                    <div className="flex items-start gap-4">
                        <CommunityAvatar name={discussion.community ? (discussion.community_name || discussion.community?.name) : (discussion.created_by_name || 'User')} />

                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                {/* LEFT */}
                                <div>
                                    <span className="text-xs font-medium text-gray-500">
                                        Posted by{" "}
                                        <span className="text-gray-900 font-semibold">
                                            {discussion.created_by_name || "User"}
                                        </span>{" "}
                                        • {discussion.time_ago}
                                    </span>
                                </div>

                                {/* RIGHT (badges + delete) */}
                                <div className="flex items-center gap-2">
                                    <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                                        Discussion
                                    </span>

                                    <span
                                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${discussion.visibility === "public"
                                            ? "bg-green-100 text-green-700 border-green-200"
                                            : "bg-gray-100 text-gray-600 border-gray-200"
                                            }`}
                                    >
                                        {discussion.visibility || "Public"}
                                    </span>

                                    {isOwner && (
                                        <button
                                            onClick={handleDeleteDiscussion}
                                            className="text-gray-400 hover:text-red-500 p-1"
                                            title="Delete Discussion"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>


                            <h1 className="mt-3 text-2xl font-bold text-gray-900 leading-tight">
                                {discussion.topic}
                            </h1>

                            <div className="mt-4 text-gray-700 text-[16px] leading-relaxed whitespace-pre-wrap">
                                {discussion.content}
                            </div>

                            <ActionButtons
                                item={discussion}
                                onReaction={() => handleReaction()}
                                showShare={false}
                            />
                        </div>
                    </div>
                </article>

                <CommentSection
                    comments={discussion.replies}
                    onPostComment={handlePostReply}
                    onDeleteComment={handleDeleteReply}
                    onToggleReaction={handleReaction}
                    currentUser={currentUser}
                    submitting={submitting}
                />

            </main>
        </div>
    );
}
