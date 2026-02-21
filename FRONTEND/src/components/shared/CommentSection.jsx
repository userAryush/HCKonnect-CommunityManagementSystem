import { useState } from 'react';
import { ThumbsUp, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export default function CommentSection({
    comments,
    onPostComment,
    onDeleteComment,
    onToggleReaction,
    currentUser,
    submitting,
    hasMore = false,
    onLoadMore = null,
    loadingMore = false
}) {
    const [mainComment, setMainComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [childComment, setChildComment] = useState('');

    const handlePostMain = () => {
        if (!mainComment.trim()) return;
        onPostComment(null, mainComment);
        setMainComment('');
    };

    const handlePostReply = (parentId) => {
        if (!childComment.trim()) return;
        onPostComment(parentId, childComment);
        setChildComment('');
        setReplyingTo(null);
    };

    const ReplyItem = ({ reply, isNested = false }) => {
        const [isExpanded, setIsExpanded] = useState(false);
        const isAuthor = currentUser && String(currentUser.id) === String(reply.author || reply.created_by);
        const children = reply.replies || reply.children || [];
        const displayLimit = 3;
        const visibleChildren = isExpanded ? children : children.slice(0, displayLimit);
        const remainingCount = children.length - displayLimit;

        return (
            <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4 ${isNested ? 'ml-0 mt-2 border-none shadow-none bg-transparent' : ''}`}>
                <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 text-sm font-bold">
                                {(reply.author_name || reply.created_by_name || 'U')[0].toUpperCase()}
                            </div>
                            <div>
                                <p className="font-bold text-sm text-gray-900 leading-none">
                                    {reply.author_name || reply.created_by_name || 'User'}
                                </p>
                                <p className="text-[11px] text-gray-400 mt-1">{reply.time_ago}</p>
                            </div>
                        </div>
                        {isAuthor && (
                            <button onClick={() => onDeleteComment(reply.id)} className="text-gray-300 hover:text-red-500 transition">
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>

                    <p className="text-gray-800 text-[15px] mb-4 whitespace-pre-wrap leading-relaxed">
                        {reply.content || reply.reply_content}
                    </p>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => onToggleReaction(reply.id)}
                            className={`flex items-center gap-1.5 text-sm transition font-bold ${reply.user_has_liked ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <ThumbsUp
                                size={18}
                                className={`${reply.user_has_liked ? 'text-green-600 fill-green-600' : ''} transition-all`}
                            />
                            <span>{reply.reaction_count || 0} Likes</span>
                        </button>
                        {!isNested && (
                            <button
                                onClick={() => setReplyingTo(replyingTo === reply.id ? null : reply.id)}
                                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition font-semibold"
                            >
                                <span>Reply {children.length > 0 && `(${children.length})`}</span>
                            </button>
                        )}
                    </div>

                    {replyingTo === reply.id && (
                        <div className="mt-4 pt-4 border-t border-gray-50 flex gap-3">
                            <div className="flex-1">
                                <textarea
                                    value={childComment}
                                    onChange={(e) => setChildComment(e.target.value)}
                                    placeholder="Add a reply..."
                                    className="w-full p-3 text-sm bg-gray-50 border-none rounded-xl outline-none focus:ring-1 focus:ring-green-500 resize-none transition text-gray-500"
                                    rows={2}
                                />
                                <div className="flex justify-end mt-2 gap-2">
                                    <button onClick={() => setReplyingTo(null)} className="px-4 py-1.5 text-xs text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
                                    <button
                                        onClick={() => handlePostReply(reply.id)}
                                        disabled={submitting || !childComment.trim()}
                                        className="px-4 py-1.5 text-xs bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 shadow-sm"
                                    >
                                        Post
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {children.length > 0 && (
                    <div className="bg-gray-50/50 border-t border-gray-50 px-5 py-3">
                        <div className="space-y-4">
                            {visibleChildren.map(child => (
                                <ReplyItem key={child.id} reply={child} isNested={true} />
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

    return (
        <div className="mt-10">
            {/* Main Input */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-10">
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-6 w-6 rounded-full bg-green-100" />
                    <h3 className="text-[15px] font-bold text-gray-900">Add a Comment</h3>
                </div>
                <textarea
                    value={mainComment}
                    onChange={(e) => setMainComment(e.target.value)}
                    placeholder="Share your perspective..."
                    className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-green-500 outline-none transition resize-none text-gray-900 min-h-[120px]"
                />
                <div className="flex justify-end mt-4">
                    <button
                        onClick={handlePostMain}
                        disabled={submitting || !mainComment.trim()}
                        className="px-8 py-3 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition shadow-lg shadow-green-200 disabled:opacity-50 font-bold"
                    >
                        {submitting ? 'Posting...' : 'Post Comment'}
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="space-y-2">
                {comments && comments.length > 0 ? (
                    <>
                        {comments.map(comment => (
                            <ReplyItem key={comment.id} reply={comment} />
                        ))}

                        {hasMore && (
                            <div className="flex justify-center mt-8 pb-4">
                                <button
                                    onClick={onLoadMore}
                                    disabled={loadingMore}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white border border-gray-200 text-sm font-bold text-green-600 hover:bg-gray-50 transition shadow-sm disabled:opacity-50"
                                >
                                    {loadingMore ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                                    ) : (
                                        <ChevronDown size={16} />
                                    )}
                                    View more comments
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500 font-bold">No comments yet. Start the conversation!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
