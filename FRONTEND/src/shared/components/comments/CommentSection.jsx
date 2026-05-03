import { useState, useRef, useEffect, Fragment } from 'react';
import { useAuth } from '../../../features/authentication/components/AuthContext';
import ConfirmationModal from '../modals/ConfirmationModal';
import CommentComposer from './CommentComposer';
import CommentItem from './CommentItem';
import { CommentSkeletonRows } from '../layout/Skeleton';

/** Batch size from API — sentinel sits after the 10th row so rows 11–14 prefetch the next page. */
const SENTINEL_AFTER_INDEX = 9;

function shouldRenderSentinelAfterRow(index, totalCount) {
    if (totalCount <= 0) return false;
    if (totalCount > SENTINEL_AFTER_INDEX + 1) {
        return index === SENTINEL_AFTER_INDEX;
    }
    return index === totalCount - 1;
}

export default function CommentSection({
    comments,
    onPostComment,
    onDeleteComment,
    onEditComment,
    onToggleReaction,
    currentUser,
    submitInFlight,
    hasMore = false,
    onLoadMore = null,
    loadingMore = false,
    loadMoreError = null,
}) {
    const authContext = useAuth();
    const authUser = authContext?.user ?? null;
    const viewerUser = authUser ?? currentUser;

    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [deleteLoading,  setDeleteLoading]  = useState(false);

    const sentinelRef    = useRef(null);
    const onLoadMoreRef  = useRef(onLoadMore);
    const loadingMoreRef = useRef(loadingMore);
    const hasMoreRef     = useRef(hasMore);

    onLoadMoreRef.current  = onLoadMore;
    loadingMoreRef.current = loadingMore;
    hasMoreRef.current     = hasMore;

    /**
     * Sentinel sits after the 10th comment (when ≥11 loaded): intersecting it prefetches
     * the next batch while the user is still viewing comments 10–11. Guards avoid duplicate requests.
     */
    useEffect(() => {
        const el = sentinelRef.current;
        if (!el || !onLoadMore || !hasMore) return;

        let raf = 0;
        const observer = new IntersectionObserver(
            (entries) => {
                if (!entries.some((e) => e.isIntersecting)) return;
                if (!hasMoreRef.current || loadingMoreRef.current) return;
                cancelAnimationFrame(raf);
                raf = requestAnimationFrame(() => {
                    if (!hasMoreRef.current || loadingMoreRef.current) return;
                    onLoadMoreRef.current?.();
                });
            },
            { root: null, rootMargin: '0px 0px 96px 0px', threshold: 0 }
        );
        observer.observe(el);
        return () => {
            cancelAnimationFrame(raf);
            observer.disconnect();
        };
    }, [onLoadMore, hasMore, comments?.length]);

    const confirmDelete = async () => {
        if (deleteTargetId == null) return;
        setDeleteLoading(true);
        try {
            await onDeleteComment(deleteTargetId);
            setDeleteTargetId(null);
        } finally {
            setDeleteLoading(false);
        }
    };

    const sharedItemProps = {
        onDeleteRequest: setDeleteTargetId,
        onToggleReaction,
        onPostComment,
        onEditComment,
        submitInFlight,
        currentUser,
        viewerUser,
    };

    return (
        <div className="comment-section mt-8">
            <ConfirmationModal
                isOpen={deleteTargetId != null}
                onClose={() => !deleteLoading && setDeleteTargetId(null)}
                onConfirm={confirmDelete}
                title="Delete this comment?"
                message="This cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                isLoading={deleteLoading}
                loadingText="Deleting..."
            />

            <CommentComposer
                viewerUser={viewerUser}
                onPostComment={onPostComment}
                submitInFlight={submitInFlight}
            />

            <div>
                {comments?.length > 0 ? (
                    <>
                        <div className="space-y-1">
                            {comments.map((comment, index) => (
                                <Fragment key={comment.id}>
                                    <CommentItem reply={comment} depth={0} {...sharedItemProps} />
                                    {hasMore &&
                                        onLoadMore &&
                                        shouldRenderSentinelAfterRow(index, comments.length) && (
                                            <div
                                                ref={sentinelRef}
                                                className="h-px w-full overflow-hidden pointer-events-none opacity-0"
                                                aria-hidden="true"
                                            />
                                        )}
                                </Fragment>
                            ))}
                        </div>

                        {loadingMore && <CommentSkeletonRows count={2} />}

                        {loadMoreError && (
                            <p className="text-center text-[13px] text-red-500 dark:text-red-400 mt-4 px-2">
                                {loadMoreError}
                            </p>
                        )}
                    </>
                ) : (
                    <div className="text-center py-16 rounded-2xl border border-dashed border-surface-border bg-[var(--surface-muted-bg)]/60 dark:bg-[var(--surface-muted-bg)]/40">
                        <p className="text-[14px] text-[var(--surface-muted-text)] font-medium">
                            No comments yet — be the first!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// import { useState, useRef, useEffect } from 'react';
// import { ThumbsUp, ChevronDown, ChevronUp, CornerDownRight, MoreVertical, Pencil } from 'lucide-react';
// import { formatTimeAgo } from '../../../utils/timeFormatter';
// import { commentAuthorItem, sessionUserAsItem } from '../../../utils/userUtils';
// import { useAuth } from '../../../features/authentication/components/AuthContext';
// import { UserAvatar, UserProfileName } from '../card/UserInfo';
// import Button from '../ui/Button';
// import ConfirmationModal from '../modals/ConfirmationModal';

// function CommentSkeletonRows({ count = 2 }) {
//     return (
//         <div className="space-y-3 mt-4 px-1" aria-busy="true" aria-label="Loading comments">
//             {Array.from({ length: count }, (_, i) => (
//                 <div key={`sk-${i}`} className="flex gap-3 animate-pulse">
//                     <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-zinc-600 flex-shrink-0" />
//                     <div className="flex-1 space-y-2 min-w-0">
//                         <div className="h-3 bg-gray-200 dark:bg-zinc-600 rounded w-28 max-w-[40%]" />
//                         <div className="h-3 bg-gray-100 dark:bg-zinc-700 rounded w-full" />
//                         <div className="h-3 bg-gray-100 dark:bg-zinc-700 rounded w-4/5 max-w-[85%]" />
//                     </div>
//                 </div>
//             ))}
//         </div>
//     );
// }

// function isCommentEdited(reply) {
//     if (!reply.updated_at || !reply.created_at) return false;
//     return new Date(reply.updated_at).getTime() > new Date(reply.created_at).getTime();
// }

// function CommentItem({
//     reply,
//     depth,
//     onDeleteRequest,
//     onToggleReaction,
//     onPostComment,
//     onEditComment,
//     submitInFlight,
//     currentUser,
//     viewerUser,
// }) {
//     const me = viewerUser ?? currentUser;
//     const viewerItem = sessionUserAsItem(me);
//     const authorItem = commentAuthorItem(reply);
//     const ownerId = authorItem?.author;
//     const [isExpanded, setIsExpanded]   = useState(false);
//     const [isReplying, setIsReplying]   = useState(false);
//     const [replyText,  setReplyText]    = useState('');
//     const [menuOpen, setMenuOpen]       = useState(false);
//     const [isEditing, setIsEditing]     = useState(false);
//     const [editText, setEditText]       = useState('');
//     const menuRef = useRef(null);

//     const isAuthor   = currentUser && ownerId != null && String(currentUser.id) === String(ownerId);
//     const children   = reply.replies || reply.children || [];
//     const displayLimit   = 3;
//     const visibleChildren = isExpanded ? children : children.slice(0, displayLimit);
//     const remainingCount  = children.length - displayLimit;
//     const canReply   = depth < 2;
//     const edited     = isCommentEdited(reply);
//     const rid        = String(reply.id);
//     const replySaving =
//         submitInFlight?.type === 'reply' && submitInFlight.parentId === rid;
//     const editSaving =
//         submitInFlight?.type === 'edit' && submitInFlight.commentId === rid;

//     const timeLabel  = formatTimeAgo(reply.created_at) || reply.time_ago || '';

//     useEffect(() => {
//         if (!menuOpen) return;
//         const onDoc = (e) => {
//             if (menuRef.current && !menuRef.current.contains(e.target)) {
//                 setMenuOpen(false);
//             }
//         };
//         document.addEventListener('mousedown', onDoc);
//         return () => document.removeEventListener('mousedown', onDoc);
//     }, [menuOpen]);

//     const handleOpenReply = () => {
//         setIsEditing(false);
//         setIsReplying(true);
//         setReplyText('');
//     };

//     const handleCancelReply = () => {
//         setIsReplying(false);
//         setReplyText('');
//     };

//     const handleSubmitReply = async () => {
//         if (!replyText.trim()) return;
//         try {
//             await onPostComment(reply.id, replyText);
//             setReplyText('');
//             setIsReplying(false);
//         } catch {
//             /* keep composer open */
//         }
//     };

//     const startEdit = () => {
//         setIsReplying(false);
//         setReplyText('');
//         setEditText(reply.content ?? reply.reply_content ?? '');
//         setIsEditing(true);
//     };

//     const cancelEdit = () => {
//         setIsEditing(false);
//         setEditText('');
//     };

//     const saveEdit = async () => {
//         const next = editText.trim();
//         if (!next) return;
//         try {
//             await onEditComment(reply.id, next);
//             setIsEditing(false);
//             setEditText('');
//         } catch {
//             /* stay in edit mode */
//         }
//     };

//     const displayContent = reply.content ?? reply.reply_content ?? '';

//     return (
//         <div className="flex gap-0 relative">
//             <div className="flex flex-col items-center" style={{ width: 44, flexShrink: 0 }}>
//                 <div style={{ zIndex: 1 }}>
//                     <UserAvatar item={authorItem} size="sm" />
//                 </div>

//                 {(children.length > 0 || isReplying) && (
//                     <div
//                         className="w-0.5 flex-1 mt-1 bg-gradient-to-b from-emerald-200 to-gray-200 dark:from-emerald-900/60 dark:to-zinc-600"
//                         style={{ minHeight: 20 }}
//                     />
//                 )}
//             </div>

//             <div className="flex-1 pb-4 pl-3" style={{ minWidth: 0 }}>

//                 <div className="flex items-start justify-between mb-0.5 gap-2">
//                     <div className="flex items-center gap-2 flex-wrap min-w-0">
//                         <UserProfileName
//                             item={authorItem}
//                             className={`text-[14px] leading-snug hover:text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm ${depth === 0 ? '' : 'opacity-95'}`}
//                         />
//                         {reply.author_role === 'community' && (
//                             <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 tracking-wide">
//                                 Admin
//                             </span>
//                         )}
//                         <span className="text-[12px] text-[var(--surface-muted-text)]">
//                             {reply.author_role !== 'community' && (
//                                 reply.author_community ? `· ${reply.author_community}` : '· Student'
//                             )}
//                         </span>
//                         <span className="text-[12px] text-[var(--surface-muted-text)]">
//                             · {timeLabel}
//                             {edited && (
//                                 <span> · edited</span>
//                             )}
//                         </span>
//                     </div>
//                     {isAuthor && !isEditing && (
//                         <div className="relative flex-shrink-0" ref={menuRef}>
//                             <button
//                                 type="button"
//                                 onClick={() => setMenuOpen((o) => !o)}
//                                 className="p-1.5 rounded-lg text-[var(--surface-muted-text)] hover:text-[var(--surface-heading)] hover:bg-[var(--surface-muted-bg)] dark:hover:bg-zinc-700/80 transition-colors"
//                                 aria-expanded={menuOpen}
//                                 aria-haspopup="menu"
//                                 aria-label="Comment actions"
//                             >
//                                 <MoreVertical size={16} />
//                             </button>
//                             {menuOpen && (
//                                 <div
//                                     className="absolute right-0 top-full mt-1 z-20 min-w-[148px] rounded-xl border border-surface-border bg-[var(--surface-card)] py-1 shadow-lg dark:shadow-xl dark:shadow-black/40"
//                                     role="menu"
//                                 >
//                                     <button
//                                         type="button"
//                                         role="menuitem"
//                                         className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-[var(--app-text)] hover:bg-[var(--surface-muted-bg)] dark:hover:bg-zinc-700/60"
//                                         onClick={() => {
//                                             setMenuOpen(false);
//                                             startEdit();
//                                         }}
//                                     >
//                                         <Pencil size={14} className="text-[var(--surface-muted-text)]" />
//                                         Edit
//                                     </button>
//                                     <button
//                                         type="button"
//                                         role="menuitem"
//                                         className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
//                                         onClick={() => {
//                                             setMenuOpen(false);
//                                             onDeleteRequest(reply.id);
//                                         }}
//                                     >
//                                         Delete
//                                     </button>
//                                 </div>
//                             )}
//                         </div>
//                     )}
//                 </div>

//                 {isEditing ? (
//                     <div className="mb-2">
//                         <div className="rounded-xl border border-surface-border bg-[var(--surface-muted-bg)] focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/25 transition-all">
//                             <textarea
//                                 value={editText}
//                                 onChange={(e) => setEditText(e.target.value)}
//                                 className="w-full rounded-xl bg-transparent px-3 py-2.5 text-[14px] leading-relaxed text-[var(--app-text)] outline-none resize-none min-h-[72px] border-0 focus:ring-0"
//                                 rows={3}
//                                 autoFocus
//                             />
//                         </div>
//                         <div className="mt-2 flex justify-end gap-2">
//                             <button
//                                 type="button"
//                                 onClick={cancelEdit}
//                                 className="text-[12px] font-medium text-[var(--surface-muted-text)] hover:text-[var(--surface-heading)] px-3 py-1.5"
//                             >
//                                 Cancel
//                             </button>
//                             <Button
//                                 variant="primary"
//                                 onClick={saveEdit}
//                                 isLoading={editSaving}
//                                 disabled={!editText.trim() || editText.trim() === displayContent.trim()}
//                                 className="!text-[12px] !py-1.5 !px-4 !rounded-lg"
//                                 loadingText="Saving..."
//                             >
//                                 Save
//                             </Button>
//                         </div>
//                     </div>
//                 ) : (
//                     <p className={`text-[14px] leading-relaxed whitespace-pre-wrap mb-2 text-[var(--app-text)] ${depth === 0 ? '' : 'opacity-90'}`}>
//                         {displayContent}
//                     </p>
//                 )}

//                 {!isEditing && (
//                     <div className="flex items-center gap-4">
//                         <button
//                             type="button"
//                             onClick={() => onToggleReaction(reply.id)}
//                             className={`flex items-center gap-1.5 text-[13px] font-medium transition-colors
//                                 ${reply.user_has_liked ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--surface-muted-text)] hover:text-[var(--surface-heading)]'}`}
//                         >
//                             <ThumbsUp
//                                 size={14}
//                                 className={reply.user_has_liked ? 'fill-emerald-500 text-emerald-500' : ''}
//                             />
//                             <span>{reply.reaction_count || 0}</span>
//                         </button>

//                         {canReply && !isReplying && (
//                             <button
//                                 type="button"
//                                 onClick={handleOpenReply}
//                                 className="flex items-center gap-1 text-[13px] font-medium text-[var(--surface-muted-text)] hover:text-[var(--surface-heading)] transition-colors"
//                             >
//                                 <CornerDownRight size={13} />
//                                 <span>Reply{children.length > 0 ? ` (${children.length})` : ''}</span>
//                             </button>
//                         )}

//                         {canReply && isReplying && (
//                             <span className="flex items-center gap-1 text-[13px] font-medium text-emerald-600 dark:text-emerald-400">
//                                 <CornerDownRight size={13} />
//                                 <span>Replying…</span>
//                             </span>
//                         )}

//                         {!isExpanded && remainingCount > 0 && (
//                             <button
//                                 type="button"
//                                 onClick={() => setIsExpanded(true)}
//                                 className="flex items-center gap-1 text-[13px] text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
//                             >
//                                 <ChevronDown size={13} /> {remainingCount} more
//                             </button>
//                         )}
//                         {isExpanded && children.length > displayLimit && (
//                             <button
//                                 type="button"
//                                 onClick={() => setIsExpanded(false)}
//                                 className="flex items-center gap-1 text-[13px] text-[var(--surface-muted-text)] font-medium hover:underline"
//                             >
//                                 <ChevronUp size={13} /> Hide
//                             </button>
//                         )}
//                     </div>
//                 )}

//                 {isReplying && (
//                     <div className="mt-3 flex gap-2 items-start">
//                         <UserAvatar
//                             item={viewerItem}
//                             size="xs"
//                             className="ring-2 ring-white dark:ring-[var(--surface-card)]"
//                         />
//                         <div className="flex-1 bg-[var(--surface-muted-bg)] rounded-xl border border-surface-border overflow-hidden focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/25 transition-all">
//                             <textarea
//                                 value={replyText}
//                                 onChange={(e) => setReplyText(e.target.value)}
//                                 placeholder="Write a reply..."
//                                 className="w-full px-3 pt-2.5 pb-1 text-[13px] bg-transparent border-none outline-none resize-none text-[var(--app-text)] placeholder-[color:var(--surface-muted-text)]"
//                                 rows={2}
//                                 autoFocus
//                             />
//                             <div className="flex justify-end gap-2 px-3 pb-2">
//                                 <button
//                                     type="button"
//                                     onClick={handleCancelReply}
//                                     disabled={replySaving}
//                                     className="text-[12px] text-[var(--surface-muted-text)] font-medium hover:text-[var(--surface-heading)] px-2 py-1 disabled:opacity-50"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <Button
//                                     variant="primary"
//                                     onClick={handleSubmitReply}
//                                     isLoading={replySaving}
//                                     disabled={!replyText.trim()}
//                                     className="!text-[12px] !py-1 !px-3 !rounded-lg"
//                                     loadingText="Posting..."
//                                 >
//                                     Reply
//                                 </Button>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {visibleChildren.length > 0 && (
//                     <div className="mt-3 space-y-0">
//                         {visibleChildren.map(child => (
//                             <CommentItem
//                                 key={child.id}
//                                 reply={child}
//                                 depth={depth + 1}
//                                 onDeleteRequest={onDeleteRequest}
//                                 onToggleReaction={onToggleReaction}
//                                 onPostComment={onPostComment}
//                                 onEditComment={onEditComment}
//                                 submitInFlight={submitInFlight}
//                                 currentUser={currentUser}
//                                 viewerUser={viewerUser}
//                             />
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

// export default function CommentSection({
//     comments,
//     onPostComment,
//     onDeleteComment,
//     onEditComment,
//     onToggleReaction,
//     currentUser,
//     submitInFlight,
//     hasMore = false,
//     onLoadMore = null,
//     loadingMore = false,
//     loadMoreError = null,
// }) {
//     const authContext = useAuth();
//     const authUser = authContext?.user ?? null;
//     const viewerUser = authUser ?? currentUser;
//     const composerUserItem = sessionUserAsItem(viewerUser);

//     const [mainComment, setMainComment] = useState('');
//     const [deleteTargetId, setDeleteTargetId] = useState(null);
//     const [deleteLoading, setDeleteLoading] = useState(false);

//     const sentinelRef = useRef(null);
//     const onLoadMoreRef = useRef(onLoadMore);
//     onLoadMoreRef.current = onLoadMore;
//     const loadingMoreRef = useRef(loadingMore);
//     loadingMoreRef.current = loadingMore;
//     const hasMoreRef = useRef(hasMore);
//     hasMoreRef.current = hasMore;

//     /**
//      * IntersectionObserver with rootMargin preloads before the user hits the absolute bottom
//      * (smoother UX). Refs avoid stale closures and double-fetches while loadingMore is true.
//      */
//     useEffect(() => {
//         const el = sentinelRef.current;
//         if (!el || !onLoadMore) return;

//         let raf = 0;
//         const observer = new IntersectionObserver(
//             (entries) => {
//                 const hit = entries.some((e) => e.isIntersecting);
//                 if (!hit) return;
//                 if (!hasMoreRef.current || loadingMoreRef.current) return;
//                 cancelAnimationFrame(raf);
//                 raf = requestAnimationFrame(() => onLoadMoreRef.current?.());
//             },
//             { root: null, rootMargin: '140px 0px', threshold: 0 }
//         );
//         observer.observe(el);
//         return () => {
//             cancelAnimationFrame(raf);
//             observer.disconnect();
//         };
//     }, [onLoadMore, hasMore, comments.length]);

//     const handlePostMain = async () => {
//         if (!mainComment.trim()) return;
//         const text = mainComment.trim();
//         try {
//             await onPostComment(null, text);
//             setMainComment('');
//         } catch {
//             /* keep draft */
//         }
//     };

//     const confirmDelete = async () => {
//         if (deleteTargetId == null) return;
//         setDeleteLoading(true);
//         try {
//             await onDeleteComment(deleteTargetId);
//             setDeleteTargetId(null);
//         } finally {
//             setDeleteLoading(false);
//         }
//     };

//     return (
//         <div className="comment-section mt-8">
//             <ConfirmationModal
//                 isOpen={deleteTargetId != null}
//                 onClose={() => !deleteLoading && setDeleteTargetId(null)}
//                 onConfirm={confirmDelete}
//                 title="Delete this comment?"
//                 message="This cannot be undone."
//                 confirmText="Delete"
//                 cancelText="Cancel"
//                 isLoading={deleteLoading}
//                 loadingText="Deleting..."
//             />

//             <div className="flex gap-3 mb-8 items-start">
//                 <UserAvatar
//                     item={composerUserItem}
//                     size="sm"
//                     className="ring-2 ring-white dark:ring-[var(--surface-card)] shadow-sm"
//                 />
//                 <div className="flex-1 bg-[var(--surface-card)] rounded-xl border border-surface-border shadow-sm overflow-hidden focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/25 transition-all dark:shadow-none">
//                     <textarea
//                         value={mainComment}
//                         onChange={(e) => setMainComment(e.target.value)}
//                         placeholder="Share your perspective..."
//                         className="w-full px-4 pt-3 pb-2 text-[14px] bg-transparent border-none outline-none resize-none text-[var(--app-text)] placeholder-[color:var(--surface-muted-text)] min-h-[80px]"
//                     />
//                     <div className="flex justify-end px-4 pb-3">
//                         <Button
//                             variant="primary"
//                             onClick={handlePostMain}
//                             isLoading={submitInFlight?.type === 'main'}
//                             disabled={!mainComment.trim()}
//                             className="!px-5 !py-2 !rounded-lg !text-[13px] font-semibold"
//                             loadingText="Posting..."
//                         >
//                             Post
//                         </Button>
//                     </div>
//                 </div>
//             </div>

//             <div>
//                 {comments && comments.length > 0 ? (
//                     <>
//                         <div className="space-y-1">
//                             {comments.map(comment => (
//                                 <CommentItem
//                                     key={comment.id}
//                                     reply={comment}
//                                     depth={0}
//                                     onDeleteRequest={setDeleteTargetId}
//                                     onToggleReaction={onToggleReaction}
//                                     onPostComment={onPostComment}
//                                     onEditComment={onEditComment}
//                                     submitInFlight={submitInFlight}
//                                     currentUser={currentUser}
//                                     viewerUser={viewerUser}
//                                 />
//                             ))}
//                         </div>

//                         {loadingMore && <CommentSkeletonRows count={2} />}

//                         {loadMoreError && (
//                             <p className="text-center text-[13px] text-red-500 dark:text-red-400 mt-4 px-2">{loadMoreError}</p>
//                         )}

//                         {hasMore && onLoadMore && (
//                             <div
//                                 ref={sentinelRef}
//                                 className="h-6 w-full mt-2"
//                                 aria-hidden="true"
//                             />
//                         )}
//                     </>
//                 ) : (
//                     <div className="text-center py-16 rounded-2xl border border-dashed border-surface-border bg-[var(--surface-muted-bg)]/60 dark:bg-[var(--surface-muted-bg)]/40">
//                         <p className="text-[14px] text-[var(--surface-muted-text)] font-medium">No comments yet — be the first!</p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }
