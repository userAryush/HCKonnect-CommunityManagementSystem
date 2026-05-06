import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import discussionService from '../service/discussionService';
import DiscussionCard from '../components/DiscussionCard';
import CommentSection from '../../../shared/components/comments/CommentSection';
import DetailPageLayout from '../../../shared/components/layout/DetailPageLayout';
import { useComments, COMMENT_PAGE_SIZE } from '../../../shared/hooks/useComments';

export default function DiscussionDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

    const {
        item: discussion,
        loading,
        submitInFlight,
        comments: replies,
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
        fetchItemFn:      (id) => discussionService.getDiscussion(id),
        fetchCommentsFn:  (resourceId, opts) => discussionService.getReplies(resourceId, opts),
        createCommentFn:  (payload) => discussionService.createReply(payload),
        deleteCommentFn:  (replyId) => discussionService.deleteReply(replyId),
        updateCommentFn:  (replyId, content) => discussionService.updateReply(replyId, { reply_content: content }),
        toggleReactionFn: (payload) => discussionService.toggleReaction(payload),
        buildCreatePayload: (parentId, content) => ({
            topic: id,
            parent_reply: parentId,
            reply_content: content,
        }),
        buildReactionPayload: (replyId, topicId) =>
            replyId ? { reply: replyId } : { topic: topicId },
        pageLimit: COMMENT_PAGE_SIZE,
    });

    useEffect(() => {
        fetchItem().catch(() => {
            navigate('/discussions');
        });
    }, [id]);

    if (!discussion && !loading) return null;

    return (
        <DetailPageLayout loading={loading} backTo="/feed">
            <div className="mb-10">
                <DiscussionCard
                    item={discussion}
                    isDetailView={true}
                    onDelete={() => navigate('/discussions')}
                />
            </div>

            <CommentSection
                comments={replies}
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
// import { Reply } from 'lucide-react';
// import discussionService from '../service/discussionService';
// import Navbar from '../../../shared/components/layout/Navbar';
// import DiscussionCard from '../components/DiscussionCard';
// import CommentSection from '../../../shared/components/ui/CommentSection';
// import BackLink from '../../../shared/components/layout/BackLink';
// import { Skeleton } from '../../../shared/components/layout/Skeleton';

// export default function DiscussionDetail() {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const [discussion, setDiscussion] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [submitting, setSubmitting] = useState(false);
//     const [replies, setReplies] = useState([]);
//     const [commentPage, setCommentPage] = useState(1);
//     const [hasMoreComments, setHasMoreComments] = useState(false);
//     const [loadingMore, setLoadingMore] = useState(false);
//     const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'
//     const [replyingTo, setReplyingTo] = useState(null); // ID of reply we are replying to

//     const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

//     useEffect(() => {
//         fetchDiscussion();
//     }, [id]);

//     const fetchDiscussion = async () => {
//         setLoading(true);
//         try {
//             const data = await discussionService.getDiscussion(id);
//             setDiscussion(data);
//             setReplies(data.replies || []);
//             setCommentPage(1);
//             const firstRepliesPage = await discussionService.getReplies(id, 1);
//             setHasMoreComments(firstRepliesPage.next !== null);
//         } catch (error) {
//             console.error("Failed to fetch discussion", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const loadMoreReplies = async () => {
//         if (loadingMore || !hasMoreComments) return;
//         setLoadingMore(true);
//         try {
//             const nextPage = commentPage + 1;
//             const data = await discussionService.getReplies(id, nextPage);
//             setReplies(prev => [...prev, ...data.results]);
//             setCommentPage(nextPage);
//             setHasMoreComments(data.next !== null);
//         } catch (error) {
//             console.error("Failed to load more replies", error);
//         } finally {
//             setLoadingMore(false);
//         }
//     };

//     const handlePostReply = async (parentId = null, content = '') => {
//         if (!content.trim()) return;

//         setSubmitting(true);
//         try {
//             await discussionService.createReply({
//                 topic: id,
//                 parent_reply: parentId,
//                 reply_content: content
//             });
//             if (!parentId) {
//                 // Scroll to bottom after a delay to allow list to render
//                 setTimeout(() => {
//                     window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
//                 }, 500);
//             }
//             setReplyingTo(null);
//             fetchDiscussion();
//         } catch (error) {
//             console.error("Failed to post reply", error);
//             alert("Failed to post reply.");
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     const handleDeleteReply = async (replyId) => {
//         if (!window.confirm("Delete this reply?")) return;
//         try {
//             await discussionService.deleteReply(replyId);
//             fetchDiscussion();
//         } catch (error) {
//             console.error("Failed to delete reply", error);
//         }
//     };

//     const handleReaction = async (replyId = null) => {
//         try {
//             const payload = {};
//             if (replyId) {
//                 payload.reply = replyId;
//             } else {
//                 payload.topic = id;
//             }

//             // Optimistic update
//             if (replyId) {
//                 setReplies(prev => {
//                     const updateReplies = (repliesList) => repliesList.map(r => {
//                         if (r.id === replyId) {
//                             return {
//                                 ...r,
//                                 user_has_liked: !r.user_has_liked,
//                                 reaction_count: r.user_has_liked ? Math.max(0, (r.reaction_count || 0) - 1) : (r.reaction_count || 0) + 1
//                             };
//                         }
//                         return r;
//                     });
//                     return updateReplies(prev);
//                 });
//             } else {
//                 setDiscussion(prev => ({
//                     ...prev,
//                     user_has_liked: !prev.user_has_liked,
//                     reaction_count: prev.user_has_liked ? Math.max(0, prev.reaction_count - 1) : prev.reaction_count + 1
//                 }));
//             }

//             await discussionService.toggleReaction(payload);
//             // Optional: fetchDiscussion() to sync with server, but optimistic should feel better
//         } catch (error) {
//             console.error("Failed to react", error);
//             fetchDiscussion(); // Revert on error
//         }
//     };

//     const handleDeleteDiscussion = async () => {
//         if (window.confirm("Delete this discussion?")) {
//             try {
//                 await discussionService.deleteDiscussion(id);
//                 navigate('/discussions');
//             } catch (error) {
//                 console.error("Failed to delete discussion", error);
//                 alert("Failed to delete discussion");
//             }
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

//     if (!discussion) return null;

//     const isOwner = currentUser && String(currentUser.id) === String(discussion.created_by);

//     return (
//         <div className="min-h-screen bg-secondary flex flex-col pt-16">
//             <Navbar navSolid={true} />
//             <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">


//                 <BackLink to="/feed" text="Feed" />

//                 {/* Unified Card Component */}
//                 <div className="mb-10">
//                     <DiscussionCard
//                         item={discussion}
//                         isDetailView={true}
//                         onDelete={() => navigate('/discussions')}
//                     />
//                 </div>

//                 <CommentSection
//                     comments={replies}
//                     onPostComment={handlePostReply}
//                     onDeleteComment={handleDeleteReply}
//                     onToggleReaction={handleReaction}
//                     currentUser={currentUser}
//                     submitting={submitting}
//                     hasMore={hasMoreComments}
//                     onLoadMore={loadMoreReplies}
//                     loadingMore={loadingMore}
//                 />

//             </main>
//         </div>
//     );
// }
