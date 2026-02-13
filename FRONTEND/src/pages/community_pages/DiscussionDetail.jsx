import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, ThumbsUp, Trash2, Reply, CornerDownRight, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import discussionService from '../../services/discussionService';
import Navbar from '../../components/Navbar';
import CommunityAvatar from '../../components/shared/CommunityAvatar';

export default function DiscussionDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [discussion, setDiscussion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'

    // For nested replies
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
                setReplyContent('');
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

    // 2-Level Threading Logic
    const threadedReplies = useMemo(() => {
        if (!discussion || !discussion.replies) return [];

        const replies = [...discussion.replies];

        // Sort based on order
        replies.sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        const replyMap = {};
        replies.forEach(r => replyMap[r.id] = { ...r, children: [] });

        const roots = [];
        replies.forEach(r => {
            if (r.parent_reply) {
                // If it has a parent, check if that parent itself has a parent
                const parent = replyMap[r.parent_reply];
                if (parent) {
                    if (parent.parent_reply) {
                        // Level 2+ becomes Level 1 child of the original root
                        // We need to find the root. A bit recursive but for 2 levels it's simple
                        let currentRoot = parent;
                        while (currentRoot.parent_reply && replyMap[currentRoot.parent_reply]) {
                            currentRoot = replyMap[currentRoot.parent_reply];
                        }
                        currentRoot.children.push(replyMap[r.id]);
                    } else {
                        // Normal Level 1
                        parent.children.push(replyMap[r.id]);
                    }
                }
            } else {
                roots.push(replyMap[r.id]);
            }
        });

        return roots;
    }, [discussion, sortOrder]);

    const ReplyCard = ({ reply }) => {
        const [isExpanded, setIsExpanded] = useState(false);
        const [childContent, setChildContent] = useState('');
        const isAuthor = currentUser && String(currentUser.id) === String(reply.created_by);
        const children = reply.children || [];
        const displayLimit = 3;
        const visibleChildren = isExpanded ? children : children.slice(0, displayLimit);
        const remainingCount = children.length - displayLimit;

        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
                <div className="p-5">
                    {/* Main Reply Header */}
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-sm font-bold">
                                {reply.created_by_name ? reply.created_by_name[0].toUpperCase() : 'U'}
                            </div>
                            <div>
                                <p className="font-bold text-sm text-gray-900 leading-none">{reply.created_by_name || 'User'}</p>
                                <p className="text-[11px] text-gray-400 mt-1">{reply.time_ago}</p>
                            </div>
                        </div>
                        {isAuthor && (
                            <button onClick={() => handleDeleteReply(reply.id)} className="text-gray-300 hover:text-red-500 transition">
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>

                    <p className="text-gray-800 text-[15px] mb-4 whitespace-pre-wrap leading-relaxed">{reply.reply_content}</p>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => handleReaction(reply.id)}
                            className={`flex items-center gap-1.5 text-sm transition font-bold ${reply.user_has_liked ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <ThumbsUp
                                size={18}
                                className={`${reply.user_has_liked ? 'text-green-600 fill-green-600' : ''} transition-all`}
                            />
                            <span>{reply.reaction_count || 0} Likes</span>
                        </button>
                        <button
                            onClick={() => setReplyingTo(replyingTo === reply.id ? null : reply.id)}
                            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition font-semibold"
                        >
                            <MessageSquare size={18} />
                            <span>Reply {children.length > 0 && `(${children.length})`}</span>
                        </button>
                    </div>

                    {/* Nested Input for whole card */}
                    {replyingTo === reply.id && (
                        <div className="mt-4 pt-4 border-t border-gray-50 flex gap-3">
                            <div className="flex-1">
                                <textarea
                                    value={childContent}
                                    onChange={(e) => setChildContent(e.target.value)}
                                    placeholder="Add a reply..."
                                    className="w-full p-3 text-sm bg-gray-50 border-none rounded-xl outline-none focus:ring-1 focus:ring-green-500 resize-none transition text-gray-500"
                                    rows={2}
                                />
                                <div className="flex justify-end mt-2 gap-2">
                                    <button onClick={() => setReplyingTo(null)} className="px-4 py-1.5 text-xs text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
                                    <button
                                        onClick={() => handlePostReply(reply.id, childContent)}
                                        disabled={submitting || !childContent.trim()}
                                        className="px-4 py-1.5 text-xs bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 shadow-sm"
                                    >
                                        Post
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Child Replies Section */}
                {children.length > 0 && (
                    <div className="bg-gray-50/50 border-t border-gray-50 px-5 py-3">
                        <div className="space-y-4">
                            {visibleChildren.map(child => (
                                <div key={child.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <div className="h-6 w-6 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-gray-600">
                                        {child.created_by_name ? child.created_by_name[0].toUpperCase() : 'U'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="font-bold text-[13px] text-gray-900">{child.created_by_name || 'User'}</span>
                                            <span className="text-[10px] text-gray-400">{child.time_ago}</span>
                                        </div>
                                        <p className="text-[13px] text-gray-700 leading-snug">{child.reply_content}</p>
                                        <button
                                            onClick={() => handleReaction(child.id)}
                                            className={`mt-1.5 flex items-center gap-1 text-[11px] font-bold ${child.user_has_liked ? 'text-green-600' : 'text-gray-500'}`}
                                        >
                                            <ThumbsUp size={12} className={child.user_has_liked ? 'fill-green-600' : ''} />
                                            Like
                                        </button>
                                    </div>
                                    {currentUser && String(currentUser.id) === String(child.created_by) && (
                                        <button onClick={() => handleDeleteReply(child.id)} className="text-gray-300 hover:text-red-500">
                                            <Trash2 size={12} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {remainingCount > 0 && !isExpanded && (
                            <button
                                onClick={() => setIsExpanded(true)}
                                className="mt-4 text-[13px] font-bold text-green-600 flex items-center gap-1 hover:underline"
                            >
                                <ChevronDown size={14} /> View {remainingCount} more replies
                            </button>
                        )}
                        {isExpanded && children.length > displayLimit && (
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="mt-4 text-[13px] font-bold text-gray-400 flex items-center gap-1 hover:underline"
                            >
                                <ChevronUp size={14} /> Hide replies
                            </button>
                        )}
                    </div>
                )}
            </div>
        );
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

                            <div className="mt-6 flex items-center gap-8 border-t border-gray-100 pt-4">
                                <button
                                    onClick={() => handleReaction()}
                                    className={`flex items-center gap-1.5 text-sm transition font-bold ${discussion.user_has_liked ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <ThumbsUp size={18} className={discussion.user_has_liked ? 'text-green-600 fill-green-600' : ''} />
                                    <span>{discussion.reaction_count || 0} Likes</span>
                                </button>
                                <div className="flex items-center gap-1.5 text-gray-500 text-sm font-bold">
                                    <MessageSquare size={18} />
                                    <span>{discussion.reply_count || 0} Replies</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>

                {/* Main Reply Box */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-10">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-6 w-6 rounded-full bg-green-100" />
                        <h3 className="text-[15px] font-bold text-gray-900">Add a Reply</h3>
                    </div>
                    <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Share your perspective..."
                        className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-green-500 outline-none transition resize-none text-gray-900 min-h-[120px]"
                    />
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={() => handlePostReply()}
                            disabled={submitting || !replyContent.trim()}
                            className="px-8 py-3 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition shadow-lg shadow-green-200 disabled:opacity-50 font-bold"
                        >
                            {submitting ? 'Posting...' : 'Post Reply'}
                        </button>
                    </div>
                </div>

                {/* Replies Filter bar */}
                <div className="flex items-center gap-4 mb-6 px-2">
                    <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">Replies</span>
                    <div className="flex-1 h-px bg-gray-200" />
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="bg-transparent text-sm font-bold text-gray-500 outline-none cursor-pointer hover:text-gray-900 transition"
                    >
                        <option value="newest">Sort: Latest</option>
                        <option value="oldest">Sort: Oldest</option>
                    </select>
                </div>

                {/* Threaded List */}
                <div className="space-y-2">
                    {threadedReplies.length > 0 ? (
                        threadedReplies.map(reply => (
                            <ReplyCard key={reply.id} reply={reply} />
                        ))
                    ) : (
                        <div className="text-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                            <MessageSquare className="mx-auto text-gray-300 mb-3" size={48} />
                            <p className="text-gray-500 font-bold">No replies yet. Start the conversation!</p>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}
