import { useEffect, useState } from 'react';
import postService from '../service/postService';
import Button from '../../../shared/components/ui/Button';
import ModalWrapper from '../../../shared/components/modals/ModalWrapper';
import ModalHeader from '../../../shared/components/modals/ModalHeader';
import { useToast } from '../../../shared/components/ui/ToastContext';

export default function EditPostModal({ isOpen, onClose, post, onUpdated }) {
    const { showToast } = useToast();
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && post) {
            setContent(post.content || '');
            setSubmitting(false);
        }
    }, [isOpen, post]);

    const handleUpdatePost = async (e) => {
        e.preventDefault();
        if (!post?.id || !content.trim()) return;

        setSubmitting(true);
        const formData = new FormData();
        formData.append('content', content);

        try {
            const updated = await postService.updatePost(post.id, formData);
            showToast('Post updated successfully.', 'success');
            if (onUpdated) onUpdated(updated);
            onClose();
        } catch (error) {
            console.error('Failed to update post', error);
            showToast('Failed to update post. Please try again.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} className="max-w-2xl">
            <ModalHeader
                title="Edit Post"
                subtitle="Update your post content."
                onClose={onClose}
            />

            <form onSubmit={handleUpdatePost} className="space-y-6 p-8">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full min-h-[160px] resize-none input-standard"
                />

                {post?.image && (
                    <div className="relative overflow-hidden rounded-xl border border-surface-border">
                        <img src={post.image} alt="Current post" className="w-full max-h-[300px] object-cover" />
                    </div>
                )}

                <p className="text-xs text-surface-muted">Image editing is disabled for posts.</p>

                <div className="flex items-center justify-end gap-3 border-t border-surface-border pt-4">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={!content.trim()}
                        isLoading={submitting}
                        loadingText="Saving..."
                    >
                        Save Changes
                    </Button>
                </div>
            </form>
        </ModalWrapper>
    );
}
