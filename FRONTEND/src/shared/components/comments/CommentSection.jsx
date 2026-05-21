import { useState, useRef, useEffect, Fragment } from 'react';
import { useAuth } from '../../../features/authentication/components/AuthContext';
import ConfirmationModal from '../modals/ConfirmationModal';
import CommentComposer from './CommentComposer';
import CommentItem from './CommentItem';
import { CommentSkeletonRows } from '../layout/Skeleton';

/** Batch size from API — sentinel sits after the 10th row so rows 11–14 prefetch the next page. */
const SENTINEL_AFTER_INDEX = 9;

function DateSeparator({ label }) {
    return (
        <div
            className="my-5 flex w-full min-w-0 items-center gap-4"
            role="separator"
            aria-label={label}
        >
            <div
                className="min-h-0 min-w-0 flex-1 border-t border-[var(--surface-border-strong)]"
                aria-hidden
            />
            <span className="shrink-0 whitespace-nowrap px-2 text-[12px] font-medium tracking-wide text-[var(--surface-muted-text)]">
                {label}
            </span>
            <div
                className="min-h-0 min-w-0 flex-1 border-t border-[var(--surface-border-strong)]"
                aria-hidden
            />
        </div>
    );
}

function shouldRenderSentinelAfterRow(index, totalCount) {
    if (totalCount <= 0) return false;
    if (totalCount > SENTINEL_AFTER_INDEX + 1) {
        return index === SENTINEL_AFTER_INDEX;
    }
    return index === totalCount - 1;
}

export default function CommentSection({
    comments,
    /** When set, renders date separators between calendar-day groups (discussion thread). */
    commentGroups = null,
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
    hideComposer = false,
    className = 'mt-8',
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

    const flatComments = comments ?? [];
    const groups = commentGroups?.length ? commentGroups : null;
    const totalCount = groups
        ? groups.reduce((n, g) => n + (g.comments?.length || 0), 0)
        : flatComments.length;

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
    }, [onLoadMore, hasMore, totalCount]);

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

    let globalIndex = 0;

    const renderCommentRow = (comment, { isLast = false } = {}) => {
        const index = globalIndex;
        globalIndex += 1;
        return (
            <Fragment key={comment.id}>
                <CommentItem
                    reply={comment}
                    depth={0}
                    isLastTopLevel={isLast}
                    {...sharedItemProps}
                />
                {hasMore &&
                    onLoadMore &&
                    shouldRenderSentinelAfterRow(index, totalCount) && (
                        <div
                            ref={sentinelRef}
                            className="h-px w-full overflow-hidden pointer-events-none opacity-0"
                            aria-hidden="true"
                        />
                    )}
            </Fragment>
        );
    };

    return (
        <div className={`comment-section ${className}`}>
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

            {!hideComposer && (
                <CommentComposer
                    viewerUser={viewerUser}
                    onPostComment={onPostComment}
                    submitInFlight={submitInFlight}
                />
            )}

            <div>
                {totalCount > 0 ? (
                    <>
                        {groups ? (
                            groups.map((group, groupIndex) => (
                                <div key={group.dateKey} className="mb-1">
                                    <DateSeparator label={group.label} />
                                    <div>
                                        {group.comments.map((comment, commentIndex) => {
                                            const isLast =
                                                groupIndex === groups.length - 1 &&
                                                commentIndex === group.comments.length - 1;
                                            return renderCommentRow(comment, { isLast });
                                        })}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div>
                                {flatComments.map((comment, index) =>
                                    renderCommentRow(comment, {
                                        isLast: index === flatComments.length - 1,
                                    })
                                )}
                            </div>
                        )}

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
