import { useState, useRef, useCallback } from 'react';
import { sessionUserAsItem } from '../../../utils/userUtils';
import { UserAvatar } from '../card/UserInfo';
import Button from '../ui/Button';
import CommentLimitedTextarea from './CommentLimitedTextarea';
import MentionDropdown from './MentionDropdown';
import { useMention } from '../../hooks/useMention';
import { COMMENT_MAX_LENGTH } from '../../constants/commentLimits';
import postService from '../../../features/posts/service/postService';

export default function CommentComposer({ viewerUser, onPostComment, submitInFlight }) {
    const [mainComment, setMainComment] = useState('');
    const textareaRef = useRef(null);
    const composerUserItem = sessionUserAsItem(viewerUser);

    const mention = useMention({ searchFn: postService.searchMentions });

    const handleChange = useCallback((value) => {
        setMainComment(value);
        const cursor = textareaRef.current?.selectionStart ?? value.length;
        mention.onTextChange(value, cursor);
    }, [mention]);

    const handleKeyDown = useCallback((e) => {
        mention.onKeyDown(e, mainComment, textareaRef.current?.selectionStart ?? 0, (idx) => {
            const user = mention.suggestions[idx];
            if (!user) return;
            const cursor = textareaRef.current?.selectionStart ?? mainComment.length;
            const { newValue, newCursor } = mention.selectUser(user, mainComment, cursor);
            setMainComment(newValue);
            // Restore cursor after React re-render
            requestAnimationFrame(() => {
                if (textareaRef.current) {
                    textareaRef.current.selectionStart = newCursor;
                    textareaRef.current.selectionEnd = newCursor;
                }
            });
        });
    }, [mention, mainComment]);

    const handleSelectUser = useCallback((user) => {
        const cursor = textareaRef.current?.selectionStart ?? mainComment.length;
        const { newValue, newCursor } = mention.selectUser(user, mainComment, cursor);
        setMainComment(newValue);
        requestAnimationFrame(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.selectionStart = newCursor;
                textareaRef.current.selectionEnd = newCursor;
            }
        });
    }, [mention, mainComment]);

    const handlePost = async () => {
        if (!mainComment.trim()) return;
        if (mainComment.length > COMMENT_MAX_LENGTH) return;
        const text = mainComment.trim();
        const ids = mention.mentionedUserIds;
        try {
            await onPostComment(null, text, ids);
            setMainComment('');
            mention.clearMentionedUsers();
        } catch {
            /* keep draft on failure */
        }
    };

    return (
        <div className="flex gap-3 mb-8 items-start">
            <UserAvatar
                item={composerUserItem}
                size="sm"
                className="ring-2 ring-white dark:ring-[var(--surface-card)] shadow-sm"
            />
            <div className="flex-1 relative">
                <div className="bg-[var(--surface-card)] rounded-xl border border-surface-border shadow-sm overflow-hidden focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/25 transition-all dark:shadow-none">
                    <CommentLimitedTextarea
                        ref={textareaRef}
                        value={mainComment}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Share your perspective… use @ to mention someone"
                        rows={3}
                        className="px-4 pt-3 text-[14px] min-h-[80px]"
                    />
                    <div className="flex justify-end px-4 pb-3 -mt-1">
                        <Button
                            variant="primary"
                            onClick={handlePost}
                            isLoading={submitInFlight?.type === 'main'}
                            disabled={!mainComment.trim()}
                            className="!px-5 !py-2 !rounded-lg !text-[13px] font-semibold"
                            loadingText="Posting..."
                        >
                            Post
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
