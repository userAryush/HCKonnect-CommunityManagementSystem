import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Reply } from 'lucide-react';
import postService from '../service/postService';
import Navbar from '../../../shared/components/layout/Navbar';
import PostCard from '../components/PostCard';
import CommentSection from '../../../shared/components/ui/CommentSection';
import { Skeleton } from '../../../shared/components/layout/Skeleton';

export default function PostDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentPage, setCommentPage] = useState(1);
    const [hasMoreComments, setHasMoreComments] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        fetchPost();
    }, [id]);

    const fetchPost = async () => {
        setLoading(true);
        try {
            const data = await postService.getPost(id);
            setPost(data);
            setComments(data.comments || []);
            setCommentPage(1);
            // If we got exactly 10 comments, there might be more (backend limit is 10)
            setHasMoreComments(data.comments?.length === 10);
        } catch (error) {
            console.error("Failed to fetch post", error);
            if (error.response?.status === 404) {
                navigate('/posts');
            }
        } finally {
            setLoading(false);
        }
    };

    const loadMoreComments = async () => {
        if (loadingMore || !hasMoreComments) return;
        setLoadingMore(true);
        try {
            const nextPage = commentPage + 1;
            const data = await postService.getComments(id, nextPage);
            setComments(prev => [...prev, ...data.results]);
            setCommentPage(nextPage);
            setHasMoreComments(!!data.next);
        } catch (error) {
            console.error("Failed to load more comments", error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleReaction = async (commentId = null) => {
        try {
            const payload = commentId ? { comment: commentId } : { post: id };

            // Optimistic update
            if (commentId) {
                setComments(prev => {
                    const updateRefs = (commentsList) => commentsList.map(c => {
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
                    return updateRefs(prev);
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

                <div className="mb-8">
                    <PostCard
                        post={post}
                        isDetailView={true}
                        onDelete={() => navigate('/posts')}
                    />
                </div>

                <CommentSection
                    comments={comments}
                    onPostComment={handlePostComment}
                    onDeleteComment={handleDeleteComment}
                    onToggleReaction={handleReaction}
                    currentUser={currentUser}
                    submitting={submitting}
                    hasMore={hasMoreComments}
                    onLoadMore={loadMoreComments}
                    loadingMore={loadingMore}
                />
            </main>
        </div>
    );
}
