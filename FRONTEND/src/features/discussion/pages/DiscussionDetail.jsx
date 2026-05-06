import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowDown, Clock3 } from 'lucide-react';
import discussionService from '../service/discussionService';
import DiscussionStickyComposer from '../components/DiscussionStickyComposer';
import DiscussionRoomHeader from '../components/DiscussionRoomHeader';
import CommentSection from '../../../shared/components/comments/CommentSection';
import DetailPageLayout from '../../../shared/components/layout/DetailPageLayout';
import { useComments, COMMENT_PAGE_SIZE } from '../../../shared/hooks/useComments';
import { formatTimeAgo } from '../../../utils/timeFormatter';

export default function DiscussionDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    const [optimisticReplies, setOptimisticReplies] = useState([]);
    const [newReplyCount, setNewReplyCount] = useState(0);
    const [showNewRepliesBanner, setShowNewRepliesBanner] = useState(false);
    const [showJumpToLatest, setShowJumpToLatest] = useState(false);
    const lastKnownCountRef = useRef(0);
    const streamBottomRef = useRef(null);

    const {
        item: discussion,
        loading,
        submitInFlight,
        comments: replies,
        hasMore,
        loadingMore,
        loadMoreError,
        fetchItem,
        fetchComments,
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

    const scrollToBottom = useCallback((behavior = 'smooth') => {
        requestAnimationFrame(() => {
            streamBottomRef.current?.scrollIntoView({ behavior, block: 'end' });
        });
    }, []);

    useEffect(() => {
        fetchItem().catch(() => {
            navigate('/discussions');
        });
        // Intentionally keyed to route id only to avoid refetch loops
        // caused by callback identity changes from useComments config.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
        setOptimisticReplies(replies || []);
    }, [replies]);

    useEffect(() => {
        const count = replies?.length || 0;
        lastKnownCountRef.current = count;
    }, [id, replies?.length]);

    useEffect(() => {
        if (!loading) {
            scrollToBottom('auto');
        }
    }, [loading, scrollToBottom]);

    useEffect(() => {
        const onScroll = () => {
            const scrollOffset = window.scrollY || document.documentElement.scrollTop;
            setShowJumpToLatest(scrollOffset > 320);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handlePostComment = useCallback(async (parentId = null, content = '') => {
        const text = content?.trim();
        if (!text) return;

        if (parentId != null) {
            await postComment(parentId, text);
            return;
        }

        const tempId = `temp_${Date.now()}`;
        const tempReply = {
            id: tempId,
            reply_content: text,
            content: text,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: currentUser?.id ?? null,
            author: currentUser?.id ?? null,
            author_name: currentUser?.full_name || currentUser?.username || 'You',
            author_image:
                currentUser?.profile_image ||
                currentUser?.community_logo ||
                currentUser?.logo ||
                null,
            author_role: currentUser?.role || 'student',
            author_community:
                currentUser?.membership?.community_name ||
                currentUser?.community_name ||
                null,
            reaction_count: 0,
            user_has_liked: false,
            replies: [],
            children: [],
        };

        setOptimisticReplies((prev) => [...(prev || []), tempReply]);
        scrollToBottom();

        try {
            await postComment(null, text);
            scrollToBottom();
        } catch (error) {
            setOptimisticReplies((prev) => (prev || []).filter((r) => r.id !== tempId));
            throw error;
        }
    }, [currentUser, postComment, scrollToBottom]);

    useEffect(() => {
        const intervalId = setInterval(async () => {
            if (document.visibilityState !== 'visible') return;

            try {
                const data = await discussionService.getReplies(id, { cursor: null, limit: COMMENT_PAGE_SIZE });
                const latestCount = Array.isArray(data?.comments) ? data.comments.length : 0;
                const baseline = lastKnownCountRef.current;

                if (latestCount > baseline) {
                    setNewReplyCount(latestCount - baseline);
                    setShowNewRepliesBanner(true);
                }
            } catch (error) {
                // Silent poll failure keeps the discussion room usable.
                console.error('Discussion polling failed', error);
            }
        }, 20000);

        return () => clearInterval(intervalId);
    }, [id]);

    const orderedReplies = useMemo(
        () => [...(optimisticReplies || [])].reverse(),
        [optimisticReplies]
    );

    const handleLoadNewReplies = useCallback(async () => {
        const latest = await discussionService.getReplies(id, { cursor: null, limit: COMMENT_PAGE_SIZE });
        const latestCount = Array.isArray(latest?.comments) ? latest.comments.length : 0;
        await fetchComments();
        lastKnownCountRef.current = latestCount;
        setShowNewRepliesBanner(false);
        setNewReplyCount(0);
        scrollToBottom();
    }, [fetchComments, id, scrollToBottom]);

    const handleTopicReaction = useCallback(() => {
        toggleReaction(null);
    }, [toggleReaction]);

    const handleBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    const handleTitleClick = useCallback(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const replyCount = useMemo(
        () => optimisticReplies?.length || discussion?.reply_count || 0,
        [optimisticReplies?.length, discussion?.reply_count]
    );

    const roomSubtitle = useMemo(() => {
        const visibility = discussion?.visibility === 'private' ? 'Private room' : 'Public room';
        return `${visibility} • discussion panel`;
    }, [discussion?.visibility]);

    const lastReplyLabel = useMemo(() => {
        const latestTimestamp = (optimisticReplies || []).reduce((latest, reply) => {
            const rawDate = reply?.updated_at || reply?.created_at;
            if (!rawDate) return latest;
            const ts = new Date(rawDate).getTime();
            if (!Number.isFinite(ts)) return latest;
            return ts > latest ? ts : latest;
        }, 0);

        if (!latestTimestamp) return 'No replies yet';
        return `Last reply ${formatTimeAgo(new Date(latestTimestamp).toISOString())}`;
    }, [optimisticReplies]);

    if (!discussion && !loading) return null;

    return (
        <DetailPageLayout
            loading={loading}
            backTo="/feed"
            hideBackLink={true}
            showNavbar={false}
            mainClassName="max-w-none px-0 py-0"
        >
            <div className="mx-auto w-full max-w-6xl pb-32 pt-[56px]">
                <DiscussionRoomHeader
                    discussion={discussion}
                    replyCount={replyCount}
                    onToggleTopicReaction={handleTopicReaction}
                    onBack={handleBack}
                    onTitleClick={handleTitleClick}
                />

                <div className="mb-4 mt-3 flex flex-wrap items-center gap-2 px-1">
                    <span className="inline-flex items-center gap-1 rounded-full border border-surface-border bg-[var(--surface-card)] px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-[var(--surface-muted-text)]">
                        {roomSubtitle}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-surface-border bg-[var(--surface-card)] px-2.5 py-1 text-[11px] text-[var(--surface-muted-text)]">
                        <Clock3 size={12} />
                        {lastReplyLabel}
                    </span>
                </div>

                {discussion?.content && (
                    <section className="mb-4 rounded-xl border border-surface-border bg-[var(--surface-card)] px-4 py-3 shadow-sm">
                        <p className="mb-1 text-[11px] font-semibold tracking-wide text-[var(--surface-muted-text)]">
                            Discussion Panel Description
                        </p>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--app-text)]">
                            {discussion.content}
                        </p>
                    </section>
                )}

                {showNewRepliesBanner && (
                    <div className="sticky top-[60px] z-10 mb-3 flex justify-center">
                        <button
                            type="button"
                            onClick={handleLoadNewReplies}
                            className="rounded-full border border-emerald-200 bg-emerald-50/95 px-4 py-1.5 text-sm font-medium text-emerald-700 shadow-sm backdrop-blur transition hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-300"
                        >
                            {newReplyCount} new replies · click to load
                        </button>
                    </div>
                )}

                {(hasMore || loadMoreError) && (
                    <div className="mb-3 flex items-center justify-center">
                        <button
                            type="button"
                            onClick={loadMore}
                            disabled={loadingMore}
                            className="inline-flex items-center gap-2 rounded-full border border-surface-border bg-[var(--surface-card)] px-3 py-1.5 text-xs font-medium text-[var(--surface-muted-text)] shadow-sm transition hover:text-[var(--surface-heading)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loadingMore ? 'Loading older replies...' : (loadMoreError ? 'Retry loading older replies' : 'Load older replies')}
                        </button>
                    </div>
                )}

                <section className="rounded-2xl border border-surface-border bg-[var(--surface-card)] px-4 py-4 shadow-sm sm:px-5">
                    <p className="mb-1 text-[11px] font-semibold tracking-wide text-[var(--surface-muted-text)]">
                        Replies
                    </p>
                    <CommentSection
                        comments={orderedReplies}
                        onPostComment={handlePostComment}
                        onDeleteComment={deleteComment}
                        onEditComment={editComment}
                        onToggleReaction={toggleReaction}
                        currentUser={currentUser}
                        submitInFlight={submitInFlight}
                        hasMore={hasMore}
                        onLoadMore={loadMore}
                        loadingMore={false}
                        loadMoreError={loadMoreError}
                        hideComposer={true}
                    />
                </section>
                <div ref={streamBottomRef} />
            </div>

            {showJumpToLatest && (
                <button
                    type="button"
                    onClick={() => scrollToBottom()}
                    className="fixed bottom-24 right-4 z-20 inline-flex items-center gap-1 rounded-full border border-surface-border bg-[var(--surface-card)] px-3 py-1.5 text-xs font-medium text-[var(--surface-heading)] shadow-md transition hover:shadow-lg"
                >
                    <ArrowDown size={13} />
                    Latest
                </button>
            )}

            <DiscussionStickyComposer
                viewerUser={currentUser}
                onPostComment={handlePostComment}
                submitInFlight={submitInFlight}
            />
        </DetailPageLayout>
    );
}