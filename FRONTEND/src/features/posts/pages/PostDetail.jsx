import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import postService from '../service/postService';
import PostCard from '../components/PostCard';
import CommentSection from '../../../shared/components/comments/CommentSection';
import DetailPageLayout from '../../../shared/components/layout/DetailPageLayout';
import { useComments, COMMENT_PAGE_SIZE } from '../../../shared/hooks/useComments';

export default function PostDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

    const {
        item: post,
        loading,
        submitInFlight,
        comments,
        hasMore,
        loadingMore,
        loadMoreError,
        fetchItem,
        postComment,
        deleteComment,
        editComment,
        toggleReaction,
        loadMore,
    } = useComments({
        id,
        fetchItemFn:      (id) => postService.getPost(id),
        fetchCommentsFn:  (resourceId, opts) => postService.getComments(resourceId, opts),
        createCommentFn:  (payload) => postService.createComment(payload),
        deleteCommentFn:  (commentId) => postService.deleteComment(commentId),
        updateCommentFn:  (commentId, content) => postService.updateComment(commentId, { content }),
        toggleReactionFn: (payload) => postService.toggleReaction(payload),
        buildCreatePayload: (parentId, content) => ({
            post: id,
            parent_comment: parentId,
            content,
        }),
        buildReactionPayload: (commentId, postId) =>
            commentId ? { comment: commentId } : { post: postId },
        pageLimit: COMMENT_PAGE_SIZE,
    });

    useEffect(() => {
        fetchItem().catch((err) => {
            if (err?.response?.status === 404) navigate('/posts');
        });
    }, [id]);

    if (!post && !loading) return null;

    return (
        <DetailPageLayout loading={loading} backTo="/feed">
            <div className="mb-8">
                <PostCard
                    post={post}
                    isDetailView={true}
                    onDelete={() => navigate('/posts')}
                />
            </div>

            <CommentSection
                comments={comments}
                onPostComment={postComment}
                onDeleteComment={deleteComment}
                onEditComment={editComment}
                onToggleReaction={toggleReaction}
                currentUser={currentUser}
                submitInFlight={submitInFlight}
                hasMore={hasMore}
                onLoadMore={loadMore}
                loadingMore={loadingMore}
                loadMoreError={loadMoreError}
            />
        </DetailPageLayout>
    );
}

// import { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import postService from '../service/postService';
// import Navbar from '../../../shared/components/layout/Navbar';
// import PostCard from '../components/PostCard';
// import CommentSection from '../../../shared/components/ui/CommentSection';
// import { Skeleton } from '../../../shared/components/layout/Skeleton';
// import BackLink from '../../../shared/components/layout/BackLink';

// export default function PostDetail() {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const [post, setPost] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [submitting, setSubmitting] = useState(false);
//     const [comments, setComments] = useState([]);
//     const [commentPage, setCommentPage] = useState(1);
//     const [hasMoreComments, setHasMoreComments] = useState(false);
//     const [loadingMore, setLoadingMore] = useState(false);
//     const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

//     useEffect(() => {
//         fetchPost();
//     }, [id]);

//     // Fetches post + initial comments — only called on mount or post-level actions
//     const fetchPost = async () => {
//         setLoading(true);
//         try {
//             const data = await postService.getPost(id);
//             setPost(data);
//             const firstCommentsPage = await postService.getComments(id, 1);
//             setComments(firstCommentsPage.results || data.comments || []);
//             setCommentPage(1);
//             setHasMoreComments(firstCommentsPage.next !== null);
//         } catch (error) {
//             console.error("Failed to fetch post", error);
//             if (error.response?.status === 404) navigate('/posts');
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Fetches ONLY comments — called after post/delete comment, no loading state on post
//     const fetchComments = async () => {
//         try {
//             const data = await postService.getComments(id, 1);
//             setComments(data.results || []);
//             setCommentPage(1);
//             setHasMoreComments(data.next !== null);
//         } catch (error) {
//             console.error("Failed to refresh comments", error);
//         }
//     };

//     const loadMoreComments = async () => {
//         if (loadingMore || !hasMoreComments) return;
//         setLoadingMore(true);
//         try {
//             const nextPage = commentPage + 1;
//             const data = await postService.getComments(id, nextPage);
//             setComments(prev => [...prev, ...data.results]);
//             setCommentPage(nextPage);
//             setHasMoreComments(data.next !== null);
//         } catch (error) {
//             console.error("Failed to load more comments", error);
//         } finally {
//             setLoadingMore(false);
//         }
//     };

//     const handleReaction = async (commentId = null) => {
//         try {
//             const payload = commentId ? { comment: commentId } : { post: id };

//             // Optimistic update — no refetch needed at all
//             if (commentId) {
//                 setComments(prev => {
//                     const updateRefs = (list) => list.map(c => {
//                         if (c.id === commentId) {
//                             return {
//                                 ...c,
//                                 user_has_liked: !c.user_has_liked,
//                                 reaction_count: c.user_has_liked
//                                     ? Math.max(0, (c.reaction_count || 0) - 1)
//                                     : (c.reaction_count || 0) + 1,
//                             };
//                         }
//                         if (c.replies) return { ...c, replies: updateRefs(c.replies) };
//                         return c;
//                     });
//                     return updateRefs(prev);
//                 });
//             } else {
//                 setPost(prev => ({
//                     ...prev,
//                     user_has_liked: !prev.user_has_liked,
//                     reaction_count: prev.user_has_liked
//                         ? Math.max(0, prev.reaction_count - 1)
//                         : prev.reaction_count + 1,
//                 }));
//             }

//             await postService.toggleReaction(payload);
//         } catch (error) {
//             console.error("Failed to react", error);
//             // Only on failure: roll back by refetching
//             if (commentId) {
//                 fetchComments();
//             } else {
//                 fetchPost();
//             }
//         }
//     };

//     const handlePostComment = async (parentId = null, content = '') => {
//         setSubmitting(true);
//         try {
//             await postService.createComment({
//                 post: id,
//                 parent_comment: parentId,
//                 content,
//             });
//             // Only refresh comments, not the whole post
//             await fetchComments();
//         } catch (error) {
//             console.error("Failed to post comment", error);
//             alert("Failed to post comment");
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     const handleDeleteComment = async (commentId) => {
//         if (!window.confirm("Delete this comment?")) return;
//         try {
//             await postService.deleteComment(commentId);
//             // Only refresh comments, not the whole post
//             await fetchComments();
//         } catch (error) {
//             console.error("Failed to delete comment", error);
//         }
//     };

//     const handleDeletePost = async () => {
//         if (!window.confirm("Delete this post?")) return;
//         try {
//             await postService.deletePost(id);
//             navigate('/posts');
//         } catch (error) {
//             console.error("Failed to delete post", error);
//         }
//     };

//     if (loading) {
//         return (
//             <div className="min-h-screen bg-secondary pt-20">
//                 <Navbar navSolid={true} />
//                 <div className="max-w-6xl mx-auto px-4">
//                     <Skeleton className="h-60 w-full mb-6" />
//                     <Skeleton className="h-40 w-full" />
//                 </div>
//             </div>
//         );
//     }

//     if (!post) return null;

//     return (
//         <div className="min-h-screen bg-secondary pt-24">
//             <Navbar navSolid={true} />
//             <main className="max-w-6xl mx-auto px-4 py-8">

//                 <BackLink to="/feed" text="Feed" />

//                 <div className="mb-8">
//                     <PostCard
//                         post={post}
//                         isDetailView={true}
//                         onDelete={() => navigate('/posts')}
//                     />
//                 </div>

//                 <CommentSection
//                     comments={comments}
//                     onPostComment={handlePostComment}
//                     onDeleteComment={handleDeleteComment}
//                     onToggleReaction={handleReaction}
//                     currentUser={currentUser}
//                     submitting={submitting}
//                     hasMore={hasMoreComments}
//                     onLoadMore={loadMoreComments}
//                     loadingMore={loadingMore}
//                 />
//             </main>
//         </div>
//     );
// }