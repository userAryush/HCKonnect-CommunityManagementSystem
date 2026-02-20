import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Reply, Pin, Trash2 } from 'lucide-react';
import postService from '../../services/postService';
import Navbar from '../../components/Navbar';
import ActionButtons from '../../components/shared/ActionButtons';
import CommentSection from '../../components/shared/CommentSection';
import { Skeleton } from '../../components/shared/Skeleton';

export default function PostDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        fetchPost();
    }, [id]);

    const fetchPost = async () => {
        setLoading(true);
        try {
            const data = await postService.getPost(id);
            setPost(data);
        } catch (error) {
            console.error("Failed to fetch post", error);
            if (error.response?.status === 404) {
                navigate('/posts');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleReaction = async (commentId = null) => {
        try {
            const payload = commentId ? { comment: commentId } : { post: id };

            // Optimistic update
            if (commentId) {
                setPost(prev => {
                    const updateRefs = (comments) => comments.map(c => {
                        if (c.id === commentId) {
                            return {
                                ...c,
                                user_has_liked: !c.user_has_liked,
                                reaction_count: c.user_has_liked ? Math.max(0, (c.reaction_count || 0) - 1) : (c.reaction_count || 0) + 1
                            };
                        }
                        if (c.replies) {
                            return { ...c, replies: updateRefs(c.replies) };
                        }
                        return c;
                    });
                    return { ...prev, comments: updateRefs(prev.comments) };
                });
            } else {
                setPost(prev => ({
                    ...prev,
                    user_has_liked: !prev.user_has_liked,
                    reaction_count: prev.user_has_liked ? Math.max(0, prev.reaction_count - 1) : prev.reaction_count + 1
                }));
            }

            await postService.toggleReaction(payload);
        } catch (error) {
            console.error("Failed to react", error);
            fetchPost();
        }
    };

    const handlePostComment = async (parentId = null, content = '') => {
        setSubmitting(true);
        try {
            await postService.createComment({
                post: id,
                parent_comment: parentId,
                content: content
            });
            fetchPost();
        } catch (error) {
            console.error("Failed to post comment", error);
            alert("Failed to post comment");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Delete this comment?")) return;
        try {
            await postService.deleteComment(commentId);
            fetchPost();
        } catch (error) {
            console.error("Failed to delete comment", error);
        }
    };

    const handleDeletePost = async () => {
        if (!window.confirm("Delete this post?")) return;
        try {
            await postService.deletePost(id);
            navigate('/posts');
        } catch (error) {
            console.error("Failed to delete post", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20">
                <Navbar navSolid={true} />
                <div className="max-w-2xl mx-auto px-4">
                    <Skeleton className="h-60 w-full mb-6" />
                    <Skeleton className="h-40 w-full" />
                </div>
            </div>
        );
    }

    if (!post) return null;

    const isAuthor = currentUser && String(currentUser.id) === String(post.author);
    const isAdmin = currentUser && currentUser.role === 'admin';
    const canDelete = isAuthor || isAdmin;

    return (
        <div className="min-h-screen bg-gray-50 pt-24">
            <Navbar navSolid={true} />
            <main className="max-w-2xl mx-auto px-4 py-8">

                <button
                    onClick={() => navigate('/posts')}
                    className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-900 font-semibold text-sm transition"
                >
                    <Reply size={16} className="rotate-180" /> Back to Feed
                </button>

                <article className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                {post.author_name ? post.author_name[0].toUpperCase() : 'U'}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-gray-900 leading-none">{post.author_name || 'User'}</p>
                                    {post.is_pinned && (
                                        <Pin size={14} className="text-blue-500 fill-blue-500" />
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{post.time_ago}</p>
                            </div>
                        </div>

                        {canDelete && (
                            <button onClick={handleDeletePost} className="text-gray-300 hover:text-red-500 transition">
                                <Trash2 size={20} />
                            </button>
                        )}
                    </div>

                    <div className="mt-4">
                        <p className="text-gray-800 text-lg whitespace-pre-wrap leading-relaxed">
                            {post.content}
                        </p>
                    </div>

                    {post.image && (
                        <div className="mt-6 rounded-xl overflow-hidden bg-gray-100 -mx-6">
                            <img src={post.image} alt="Post content" className="w-full" />
                        </div>
                    )}

                    <ActionButtons
                        item={post}
                        onReaction={() => handleReaction()}
                        activeColor="green"
                    />
                </article>

                <CommentSection
                    comments={post.comments}
                    onPostComment={handlePostComment}
                    onDeleteComment={handleDeleteComment}
                    onToggleReaction={handleReaction}
                    currentUser={currentUser}
                    submitting={submitting}
                />
            </main>
        </div>
    );
}
