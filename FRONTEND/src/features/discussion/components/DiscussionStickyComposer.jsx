import { useState, useRef, useCallback } from 'react';
import Button from '../../../shared/components/ui/Button';
import { UserAvatar } from '../../../shared/components/card/UserInfo';
import { sessionUserAsItem } from '../../../utils/userUtils';
import { useMention } from '../../../shared/hooks/useMention';
import postService from '../../posts/service/postService';
import { AtSign } from 'lucide-react';

/** Mention suggestions rendered ABOVE the sticky bar (opens upward). */
function MentionDropdownUp({ suggestions, activeIndex, onSelect }) {
    if (!suggestions || suggestions.length === 0) return null;

    return (
        <div
            role="listbox"
            aria-label="Mention suggestions"
            className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border border-surface-border bg-[var(--surface-card)] shadow-lg dark:shadow-xl dark:shadow-black/40 overflow-hidden"
        >
            {suggestions.map((user, i) => (
                <button
                    key={user.id}
                    type="button"
                    role="option"
                    aria-selected={i === activeIndex}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        onSelect(user);
                    }}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors
                        ${i === activeIndex
                            ? 'bg-primary/10 dark:bg-primary/20'
                            : 'hover:bg-[var(--surface-muted-bg)] dark:hover:bg-zinc-700/60'
                        }`}
                >
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.username}
                            className="w-7 h-7 rounded-full object-cover flex-shrink-0 ring-1 ring-white/20"
                        />
                    ) : (
                        <div className="w-7 h-7 rounded-full flex-shrink-0 bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                            <AtSign size={13} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-[var(--app-text)] truncate leading-tight">
                            {user.full_name}
                        </p>
                        <p className="text-[11px] text-[var(--surface-muted-text)] truncate leading-tight">
                            @{user.username}
                        </p>
                    </div>
                </button>
            ))}
        </div>
    );
}

export default function DiscussionStickyComposer({
    viewerUser,
    onPostComment,
    submitInFlight,
}) {
    const [text, setText] = useState('');
    const textareaRef = useRef(null);
    const composerUserItem = sessionUserAsItem(viewerUser);
    const isPosting = submitInFlight?.type === 'main';

    const mention = useMention({ searchFn: postService.searchMentions });

    const handleChange = useCallback((e) => {
        const value = e.target.value;
        setText(value);
        const cursor = textareaRef.current?.selectionStart ?? value.length;
        mention.onTextChange(value, cursor);
    }, [mention]);

    const handleKeyDown = useCallback((e) => {
        mention.onKeyDown(e, text, textareaRef.current?.selectionStart ?? 0, (idx) => {
            const user = mention.suggestions[idx];
            if (!user) return;
            const cursor = textareaRef.current?.selectionStart ?? text.length;
            const { newValue, newCursor } = mention.selectUser(user, text, cursor);
            setText(newValue);
            requestAnimationFrame(() => {
                if (textareaRef.current) {
                    textareaRef.current.selectionStart = newCursor;
                    textareaRef.current.selectionEnd = newCursor;
                }
            });
        });
    }, [mention, text]);

    const handleSelectUser = useCallback((user) => {
        const cursor = textareaRef.current?.selectionStart ?? text.length;
        const { newValue, newCursor } = mention.selectUser(user, text, cursor);
        setText(newValue);
        requestAnimationFrame(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.selectionStart = newCursor;
                textareaRef.current.selectionEnd = newCursor;
            }
        });
    }, [mention, text]);

    const handlePost = async () => {
        const value = text.trim();
        if (!value) return;
        const ids = mention.mentionedUserIds;
        try {
            await onPostComment(null, value, ids);
            setText('');
            mention.clearMentionedUsers();
        } catch {
            // Keep draft on failure.
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-surface-border bg-[var(--surface-card)]/95 backdrop-blur-sm">
            <div className="mx-auto w-full max-w-6xl px-3 py-2">
                <div className="relative flex items-end gap-2 rounded-xl border border-surface-border bg-[var(--surface-card)] px-2 py-2 shadow-sm">
                    <UserAvatar
                        item={composerUserItem}
                        size="xs"
                        className="mb-1 ring-1 ring-white/70 dark:ring-[var(--surface-card)]"
                    />
                    <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Reply to this discussion… use @ to mention"
                        rows={1}
                        className="max-h-24 min-h-[34px] flex-1 resize-y rounded-md bg-transparent px-2 py-1.5 text-sm text-[var(--app-text)] outline-none placeholder-[color:var(--surface-muted-text)]"
                    />
                    <Button
                        variant="primary"
                        onClick={handlePost}
                        isLoading={isPosting}
                        disabled={!text.trim()}
                        className="!h-8 !rounded-md !px-3 !py-1 !text-xs font-semibold"
                        loadingText="Sending..."
                    >
                        Send
                    </Button>

                    {mention.isOpen && (
                        <MentionDropdownUp
                            suggestions={mention.suggestions}
                            activeIndex={mention.activeIndex}
                            onSelect={handleSelectUser}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
