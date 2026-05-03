import { useState, useCallback, useRef } from 'react';

/** Top-level comments/replies per cursor page (must match CommentSection sentinel batching UX). */
export const COMMENT_PAGE_SIZE = 14;

/**
 * useComments — cursor-paginated comments with infinite scroll support.
 *
 * @param {function} config.fetchCommentsFn - (resourceId, { cursor, limit }) => Promise<{ comments, next_cursor, has_more }>
 */
export function useComments({
    id,
    fetchItemFn,
    fetchCommentsFn,
    createCommentFn,
    deleteCommentFn,
    updateCommentFn,
    toggleReactionFn,
    buildCreatePayload,
    buildReactionPayload,
    pageLimit = COMMENT_PAGE_SIZE,
}) {
    const [item, setItem]               = useState(null);
    const [loading, setLoading]         = useState(true);
    const [submitInFlight, setSubmitInFlight] = useState(null);
    const [comments, setComments]       = useState([]);
    const [nextCursor, setNextCursor]   = useState(null);
    const [hasMore, setHasMore]         = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loadMoreError, setLoadMoreError] = useState(null);

    /** Prevents overlapping load-more requests (state updates are async). */
    const loadMoreLockedRef = useRef(false);

    const normalizePage = useCallback((data) => ({
        list: data?.comments ?? [],
        cursor: data?.next_cursor ?? null,
        more: !!data?.has_more,
    }), []);

    // ── Fetch parent item + first page of comments (mount) ──
    const fetchItem = useCallback(async () => {
        setLoading(true);
        try {
            // Parallel: parent payload + first comment page (two round-trips in one wall-clock wait).
            const [data, firstPage] = await Promise.all([
                fetchItemFn(id),
                fetchCommentsFn(id, { cursor: null, limit: pageLimit }),
            ]);
            setItem(data);
            const { list, cursor, more } = normalizePage(firstPage);
            setComments(list);
            setNextCursor(cursor);
            setHasMore(more);
            setLoadMoreError(null);
        } catch (error) {
            console.error('Failed to fetch item', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [id, fetchItemFn, fetchCommentsFn, normalizePage, pageLimit]);

    // ── Reset to first page (after create / delete / edit) ──
    const fetchComments = useCallback(async () => {
        try {
            const data = await fetchCommentsFn(id, { cursor: null, limit: pageLimit });
            const { list, cursor, more } = normalizePage(data);
            setComments(list);
            setNextCursor(cursor);
            setHasMore(more);
            setLoadMoreError(null);
        } catch (error) {
            console.error('Failed to refresh comments', error);
        }
    }, [id, fetchCommentsFn, normalizePage, pageLimit]);

    // ── Infinite scroll: next cursor batch ──
    const loadMore = useCallback(async () => {
        if (loadMoreLockedRef.current || !hasMore) return;
        if (nextCursor == null) return;
        loadMoreLockedRef.current = true;
        setLoadingMore(true);
        setLoadMoreError(null);
        try {
            const data = await fetchCommentsFn(id, { cursor: nextCursor, limit: pageLimit });
            const { list, cursor, more } = normalizePage(data);
            setComments((prev) => {
                const seen = new Set(prev.map((c) => String(c.id)));
                const merged = [...prev];
                for (const row of list) {
                    const sid = String(row.id);
                    if (!seen.has(sid)) {
                        seen.add(sid);
                        merged.push(row);
                    }
                }
                return merged;
            });
            setNextCursor(cursor);
            setHasMore(more);
        } catch (error) {
            console.error('Failed to load more', error);
            setLoadMoreError('Could not load more comments.');
        } finally {
            loadMoreLockedRef.current = false;
            setLoadingMore(false);
        }
    }, [id, fetchCommentsFn, hasMore, nextCursor, normalizePage, pageLimit]);

    const postComment = useCallback(async (parentId = null, content = '') => {
        if (!content.trim()) return;
        const target =
            parentId == null
                ? { type: 'main' }
                : { type: 'reply', parentId: String(parentId) };
        setSubmitInFlight(target);
        try {
            const payload = buildCreatePayload(parentId, content);
            await createCommentFn(payload);
            await fetchComments();
        } catch (error) {
            console.error('Failed to post comment', error);
            alert('Failed to post. Please try again.');
            throw error;
        } finally {
            setSubmitInFlight(null);
        }
    }, [fetchComments, buildCreatePayload, createCommentFn]);

    const deleteComment = useCallback(async (commentId) => {
        try {
            await deleteCommentFn(commentId);
            await fetchComments();
        } catch (error) {
            console.error('Failed to delete comment', error);
        }
    }, [fetchComments, deleteCommentFn]);

    const editComment = useCallback(async (commentId, content) => {
        if (!content?.trim() || !updateCommentFn) return;
        setSubmitInFlight({ type: 'edit', commentId: String(commentId) });
        try {
            await updateCommentFn(commentId, content.trim());
            await fetchComments();
        } catch (error) {
            console.error('Failed to update comment', error);
            alert('Failed to save. Please try again.');
            throw error;
        } finally {
            setSubmitInFlight(null);
        }
    }, [fetchComments, updateCommentFn]);

    const toggleReaction = useCallback(async (commentId = null) => {
        const payload = buildReactionPayload(commentId, id);

        if (commentId) {
            setComments((prev) => {
                const update = (list) => list.map((c) => {
                    if (c.id === commentId) {
                        return {
                            ...c,
                            user_has_liked: !c.user_has_liked,
                            reaction_count: c.user_has_liked
                                ? Math.max(0, (c.reaction_count || 0) - 1)
                                : (c.reaction_count || 0) + 1,
                        };
                    }
                    const nested = c.replies;
                    if (nested) return { ...c, replies: update(nested) };
                    return c;
                });
                return update(prev);
            });
        } else {
            setItem((prev) => ({
                ...prev,
                user_has_liked: !prev.user_has_liked,
                reaction_count: prev.user_has_liked
                    ? Math.max(0, prev.reaction_count - 1)
                    : prev.reaction_count + 1,
            }));
        }

        try {
            await toggleReactionFn(payload);
        } catch (error) {
            console.error('Failed to react', error);
            if (commentId) fetchComments();
            else fetchItem();
        }
    }, [id, fetchComments, fetchItem, buildReactionPayload, toggleReactionFn]);

    return {
        item, setItem,
        loading,
        submitInFlight,
        comments,
        nextCursor,
        hasMore,
        loadingMore,
        loadMoreError,
        fetchItem,
        fetchComments,
        loadMore,
        postComment,
        deleteComment,
        editComment,
        toggleReaction,
    };
}
