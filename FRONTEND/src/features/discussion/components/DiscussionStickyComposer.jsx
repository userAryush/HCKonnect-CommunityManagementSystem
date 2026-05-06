import { useState } from 'react';
import Button from '../../../shared/components/ui/Button';
import { UserAvatar } from '../../../shared/components/card/UserInfo';
import { sessionUserAsItem } from '../../../utils/userUtils';

export default function DiscussionStickyComposer({
    viewerUser,
    onPostComment,
    submitInFlight,
}) {
    const [text, setText] = useState('');
    const composerUserItem = sessionUserAsItem(viewerUser);
    const isPosting = submitInFlight?.type === 'main';

    const handlePost = async () => {
        const value = text.trim();
        if (!value) return;
        try {
            await onPostComment(null, value);
            setText('');
        } catch {
            // Keep draft on failure.
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-surface-border bg-[var(--surface-card)]/95 backdrop-blur-sm">
            <div className="mx-auto w-full max-w-6xl px-3 py-2">
                <div className="flex items-end gap-2 rounded-xl border border-surface-border bg-[var(--surface-card)] px-2 py-2 shadow-sm">
                    <UserAvatar
                        item={composerUserItem}
                        size="xs"
                        className="mb-1 ring-1 ring-white/70 dark:ring-[var(--surface-card)]"
                    />
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Reply to this discussion..."
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
                </div>
            </div>
        </div>
    );
}
