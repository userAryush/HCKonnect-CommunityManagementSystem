import { useState, useRef, useEffect, useCallback } from 'react';
import { ThumbsUp, ChevronDown, ChevronUp, CornerDownRight, MoreVertical, Pencil } from 'lucide-react';
import { formatTimeAgo } from '../../../utils/timeFormatter';
import { commentAuthorItem, sessionUserAsItem } from '../../../utils/userUtils';
import { UserAvatar, UserProfileName } from '../card/UserInfo';
import Button from '../ui/Button';
import ExpandableDescription from '../ui/ExpandableDescription';
import CommentLimitedTextarea from './CommentLimitedTextarea';
import MentionDropdown from './MentionDropdown';
import { useMention } from '../../hooks/useMention';
import {
    COMMENT_MAX_LENGTH,
    COMMENT_COLLAPSED_MAX_CHARS,
    COMMENT_COLLAPSED_MAX_LINES,
} from '../../constants/commentLimits';
import { clampToMaxLength } from '../../../utils/descriptionUtils';
import postService from '../../../features/posts/service/postService';

function isCommentEdited(reply) {
    if (!reply.updated_at || !reply.created_at) return false;
    return new Date(reply.updated_at).getTime() > new Date(reply.created_at).getTime();
}

/** Render comment text, turning @username tokens into clickable profile links. */
function CommentText({ text, className }) {
    if (!text) return null;

    const parts = text.split(/(@\w+)/g);
    return (
        <span className={className}>
            {parts.map((part, i) => {
                if (/^@\w+$/.test(part)) {
                    const username = part.slice(1);
                    return (
                        <a
                            key={i}
                            href={`/profile/${username}/`}
                            className="font-semibold text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {part}
                        </a>
                    );
                }
                return part;
            })}
        </span>
    );
}

/** Inline reply composer with @mention support. */
function ReplyComposer({ viewerItem, onSubmit, onCancel, submitInFlight }) {
    const [replyText, setReplyText] = useState('');
    const textareaRef = useRef(null);
    const mention = useMention({ searchFn: postService.searchMentions });

    const handleChange = useCallback((value) => {
        setReplyText(value);
        const cursor = textareaRef.current?.selectionStart ?? value.length;
        mention.onTextChange(value, cursor);
    }, [mention]);

    const handleKeyDown = useCallback((e) => {
        mention.onKeyDown(e, replyText, textareaRef.current?.selectionStart ?? 0, (idx) => {
            const user = mention.suggestions[idx];
            if (!user) return;
            const cursor = textareaRef.current?.selectionStart ?? replyText.length;
            const { newValue, newCursor } = mention.selectUser(user, replyText, cursor);
            setReplyText(newValue);
            requestAnimationFrame(() => {
                if (textareaRef.current) {
                    textareaRef.current.selectionStart = newCursor;
                    textareaRef.current.selectionEnd = newCursor;
                }
            });
        });
    }, [mention, replyText]);

    const handleSelectUser = useCallback((user) => {
        const cursor = textareaRef.current?.selectionStart ?? replyText.length;
        const { newValue, newCursor } = mention.selectUser(user, replyText, cursor);
        setReplyText(newValue);
        requestAnimationFrame(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.selectionStart = newCursor;
                textareaRef.current.selectionEnd = newCursor;
            }
        });
    }, [mention, replyText]);

    const handleSubmit = async () => {
        if (!replyText.trim() || replyText.length > COMMENT_MAX_LENGTH) return;
        try {
            await onSubmit(replyText.trim(), mention.mentionedUserIds);
            setReplyText('');
            mention.clearMentionedUsers();
        } catch {
            /* keep composer open */
        }
    };

    return (
        <div className="mt-3 flex gap-2 items-start">
            <UserAvatar
                item={viewerItem}
                size="xs"
                className="ring-2 ring-white dark:ring-[var(--surface-card)]"
            />
            <div className="flex-1 relative">
                <div className="bg-[var(--surface-muted-bg)] rounded-xl border border-surface-border overflow-hidden focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/25 transition-all">
                    <CommentLimitedTextarea
                        ref={textareaRef}
                        value={replyText}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Write a reply… use @ to mention"
                        rows={2}
                        autoFocus
                        className="px-3 pt-2.5 text-[13px]"
                    />
                    <div className="flex justify-end gap-2 px-3 pb-2 -mt-1">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={submitInFlight}
                            className="text-[12px] text-[var(--surface-muted-text)] font-medium hover:text-[var(--surface-heading)] px-2 py-1 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                            isLoading={submitInFlight}
                            disabled={!replyText.trim() || replyText.length > COMMENT_MAX_LENGTH}
                            className="!text-[12px] !py-1 !px-3 !rounded-lg"
                            loadingText="Posting..."
                        >
                            Reply
                        </Button>
                    </div>
                </div>

                {mention.isOpen && (
                    <MentionDropdown
                        suggestions={mention.suggestions}
                        activeIndex={mention.activeIndex}
                        onSelect={handleSelectUser}
                    />
                )}
            </div>
        </div>
    );
}

export default function CommentItem({
    reply,
    depth,
    /** When true, an ancestor opened this thread — render all nested levels without further clicks. */
    forcedExpand = false,
    onDeleteRequest,
    onToggleReaction,
    onPostComment,
    onEditComment,
    submitInFlight,
    currentUser,
    viewerUser,
    /** Less bottom padding on the final top-level row (discussion thread + sticky composer). */
    isLastTopLevel = false,
}) {
    const me = viewerUser ?? currentUser;
    const viewerItem = sessionUserAsItem(me);
    const authorItem = commentAuthorItem(reply);
    const ownerId = authorItem?.author;

    const [localRepliesOpen, setLocalRepliesOpen] = useState(false);
    /** User hid nested replies while an ancestor still has the thread expanded (middle "Hide"). */
    const [subtreeDismissed, setSubtreeDismissed] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState('');
    const menuRef = useRef(null);

    const isAuthor = currentUser && ownerId != null && String(currentUser.id) === String(ownerId);
    const children = reply.replies || reply.children || [];
    const hasReplies = children.length > 0;

    const propagateExpand = forcedExpand || localRepliesOpen;
    const showNested = propagateExpand && !subtreeDismissed;

    useEffect(() => {
        if (!forcedExpand) setSubtreeDismissed(false);
    }, [forcedExpand]);

    const canReply = depth < 2;
    const edited = isCommentEdited(reply);
    const rid = String(reply.id);

    const replySaving = submitInFlight?.type === 'reply' && submitInFlight.parentId === rid;
    const editSaving = submitInFlight?.type === 'edit' && submitInFlight.commentId === rid;
    const timeLabel = formatTimeAgo(reply.created_at) || reply.time_ago || '';
    const displayContent = reply.content ?? reply.reply_content ?? '';

    useEffect(() => {
        if (!menuOpen) return;
        const onDoc = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
        };
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, [menuOpen]);

    const openRepliesThread = () => {
        setLocalRepliesOpen(true);
        setSubtreeDismissed(false);
    };

    const hideRepliesThread = () => {
        if (localRepliesOpen) {
            setLocalRepliesOpen(false);
        } else if (forcedExpand) {
            setSubtreeDismissed(true);
        }
    };

    const handleOpenReply = () => {
        setIsEditing(false);
        setIsReplying(true);
    };
    const handleCancelReply = () => setIsReplying(false);

    const handleSubmitReply = async (text, mentionedUserIds) => {
        await onPostComment(reply.id, text, mentionedUserIds);
        setIsReplying(false);
    };

    const startEdit = () => {
        setIsReplying(false);
        setEditText(clampToMaxLength(displayContent, COMMENT_MAX_LENGTH));
        setIsEditing(true);
    };
    const cancelEdit = () => {
        setIsEditing(false);
        setEditText('');
    };
    const saveEdit = async () => {
        const next = editText.trim();
        if (!next || editText.length > COMMENT_MAX_LENGTH) return;
        try {
            await onEditComment(reply.id, next);
            setIsEditing(false);
            setEditText('');
        } catch {
            /* stay in edit mode */
        }
    };

    const sharedChildProps = {
        onDeleteRequest,
        onToggleReaction,
        onPostComment,
        onEditComment,
        submitInFlight,
        currentUser,
        viewerUser,
    };

    return (
        <div className="flex gap-0 relative">
            <div className="flex flex-col items-center" style={{ width: 44, flexShrink: 0 }}>
                <div style={{ zIndex: 1 }}>
                    <UserAvatar item={authorItem} size="sm" />
                </div>
                {((hasReplies && showNested) || isReplying) && (
                    <div
                        className="w-0.5 flex-1 mt-1 bg-gradient-to-b from-emerald-200 to-gray-200 dark:from-emerald-900/60 dark:to-zinc-600"
                        style={{ minHeight: 20 }}
                    />
                )}
            </div>

            <div
                className={`flex-1 pl-3 ${isLastTopLevel && depth === 0 ? 'pb-1' : 'pb-4'}`}
                style={{ minWidth: 0 }}
            >
                <div className="flex items-start justify-between mb-0.5 gap-2">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <UserProfileName
                            item={authorItem}
                            className={`text-[14px] leading-snug focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm ${depth === 0 ? '' : 'opacity-95'}`}
                        />
                        {reply.author_role === 'community' ? (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 tracking-wide border border-emerald-200/80 dark:border-emerald-800/60">
                                Admin
                            </span>
                        ) : (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--surface-muted-bg)] text-[var(--surface-muted-text)] border border-[var(--surface-border)]">
                                Student
                            </span>
                        )}
                        <span className="text-[12px] text-[var(--surface-muted-text)]">
                            {timeLabel}
                            {edited && <span> · edited</span>}
                        </span>
                    </div>

                    {isAuthor && !isEditing && (
                        <div className="relative flex-shrink-0" ref={menuRef}>
                            <button
                                type="button"
                                onClick={() => setMenuOpen((o) => !o)}
                                className="p-1.5 rounded-lg text-[var(--surface-muted-text)] hover:text-[var(--surface-heading)] hover:bg-[var(--surface-muted-bg)] dark:hover:bg-zinc-700/80 transition-colors"
                                aria-expanded={menuOpen}
                                aria-haspopup="menu"
                                aria-label="Comment actions"
                            >
                                <MoreVertical size={16} />
                            </button>
                            {menuOpen && (
                                <div
                                    className="absolute right-0 top-full mt-1 z-20 min-w-[148px] rounded-xl border border-surface-border bg-[var(--surface-card)] py-1 shadow-lg dark:shadow-xl dark:shadow-black/40"
                                    role="menu"
                                >
                                    <button
                                        type="button"
                                        role="menuitem"
                                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-[var(--app-text)] hover:bg-[var(--surface-muted-bg)] dark:hover:bg-zinc-700/60"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            startEdit();
                                        }}
                                    >
                                        <Pencil size={14} className="text-[var(--surface-muted-text)]" />
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        role="menuitem"
                                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            onDeleteRequest(reply.id);
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {isEditing ? (
                    <div className="mb-2">
                        <div className="rounded-xl border border-surface-border bg-[var(--surface-muted-bg)] focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/25 transition-all overflow-hidden">
                            <CommentLimitedTextarea
                                value={editText}
                                onChange={setEditText}
                                rows={3}
                                autoFocus
                                className="px-3 pt-2.5 text-[14px] leading-relaxed min-h-[72px]"
                            />
                        </div>
                        <div className="mt-2 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="text-[12px] font-medium text-[var(--surface-muted-text)] hover:text-[var(--surface-heading)] px-3 py-1.5"
                            >
                                Cancel
                            </button>
                            <Button
                                variant="primary"
                                onClick={saveEdit}
                                isLoading={editSaving}
                                disabled={
                                    !editText.trim() ||
                                    editText.trim() === displayContent.trim() ||
                                    editText.length > COMMENT_MAX_LENGTH
                                }
                                className="!text-[12px] !py-1.5 !px-4 !rounded-lg"
                                loadingText="Saving..."
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                ) : (
                    <ExpandableDescription
                        text={displayContent}
                        as="p"
                        className={`mb-2 text-[14px] text-[var(--app-text)] ${depth === 0 ? '' : 'opacity-90'}`}
                        collapsedMaxChars={COMMENT_COLLAPSED_MAX_CHARS}
                        collapsedMaxLines={COMMENT_COLLAPSED_MAX_LINES}
                        collapsedMaxHeightClass="max-h-[4.5rem]"
                        toggleClassName="mt-0.5 inline-block text-[12px] font-semibold text-[var(--surface-muted-text)] transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
                        renderText={(text, cls) => <CommentText text={text} className={cls} />}
                    />
                )}

                {!isEditing && (
                    <div className="flex flex-wrap items-center gap-4">
                        <button
                            type="button"
                            onClick={() => onToggleReaction(reply.id)}
                            className={`flex items-center gap-1.5 text-[13px] font-medium transition-colors
                                ${
                                    reply.user_has_liked
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-[var(--surface-muted-text)] hover:text-[var(--surface-heading)]'
                                }`}
                        >
                            <ThumbsUp
                                size={14}
                                className={reply.user_has_liked ? 'fill-emerald-500 text-emerald-500' : ''}
                            />
                            <span>{reply.reaction_count || 0}</span>
                        </button>

                        {canReply && !isReplying && (
                            <button
                                type="button"
                                onClick={handleOpenReply}
                                className="flex items-center gap-1 text-[13px] font-medium text-[var(--surface-muted-text)] hover:text-[var(--surface-heading)] transition-colors"
                            >
                                <CornerDownRight size={13} />
                                <span>Reply{hasReplies ? ` (${children.length})` : ''}</span>
                            </button>
                        )}

                        {canReply && isReplying && (
                            <span className="flex items-center gap-1 text-[13px] font-medium text-primary">
                                <CornerDownRight size={13} />
                                <span>Replying…</span>
                            </span>
                        )}

                        {hasReplies && !showNested && (
                            <button
                                type="button"
                                onClick={openRepliesThread}
                                className="flex items-center gap-1 text-[13px] font-medium text-primary hover:underline"
                            >
                                <ChevronDown size={13} />
                                View replies ({children.length})
                            </button>
                        )}

                        {hasReplies && showNested && (
                            <button
                                type="button"
                                onClick={hideRepliesThread}
                                className="flex items-center gap-1 text-[13px] font-medium text-[var(--surface-muted-text)] hover:underline"
                            >
                                <ChevronUp size={13} />
                                Hide replies
                            </button>
                        )}
                    </div>
                )}

                {isReplying && (
                    <ReplyComposer
                        viewerItem={viewerItem}
                        onSubmit={handleSubmitReply}
                        onCancel={handleCancelReply}
                        submitInFlight={replySaving}
                    />
                )}

                {showNested && hasReplies && (
                    <div className="mt-3 space-y-0">
                        {children.map((child) => (
                            <CommentItem
                                key={child.id}
                                reply={child}
                                depth={depth + 1}
                                forcedExpand={propagateExpand}
                                {...sharedChildProps}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
