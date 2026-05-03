import { useState } from 'react';
import { sessionUserAsItem } from '../../../utils/userUtils';
import { UserAvatar } from '../card/UserInfo';
import Button from '../ui/Button';

export default function CommentComposer({ viewerUser, onPostComment, submitInFlight }) {
    const [mainComment, setMainComment] = useState('');
    const composerUserItem = sessionUserAsItem(viewerUser);

    const handlePost = async () => {
        if (!mainComment.trim()) return;
        const text = mainComment.trim();
        try {
            await onPostComment(null, text);
            setMainComment('');
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
            <div className="flex-1 bg-[var(--surface-card)] rounded-xl border border-surface-border shadow-sm overflow-hidden focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/25 transition-all dark:shadow-none">
                <textarea
                    value={mainComment}
                    onChange={(e) => setMainComment(e.target.value)}
                    placeholder="Share your perspective..."
                    className="w-full px-4 pt-3 pb-2 text-[14px] bg-transparent border-none outline-none resize-none text-[var(--app-text)] placeholder-[color:var(--surface-muted-text)] min-h-[80px]"
                />
                <div className="flex justify-end px-4 pb-3">
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
        </div>
    );
}