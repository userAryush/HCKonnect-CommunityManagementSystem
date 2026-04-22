import { useEffect, useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import postService from '../service/postService';
import Button from '../../../shared/components/ui/Button';
import ModalWrapper from '../../../shared/components/modals/ModalWrapper';
import ModalHeader from '../../../shared/components/modals/ModalHeader';
import { useToast } from '../../../shared/components/ui/ToastContext';

export default function CreatePostModal({ isOpen, onClose, onCreated }) {
    const { showToast } = useToast();
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setContent('');
            setImage(null);
            setImagePreview(null);
            setSubmitting(false);
        }
    }, [isOpen]);

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImage(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!content.trim() && !image) return;

        setSubmitting(true);
        const formData = new FormData();
        formData.append('content', content);
        if (image) formData.append('image', image);

        try {
            await postService.createPost(formData);
            showToast('Post created successfully.', 'success');
            if (onCreated) onCreated();
            onClose();
        } catch (error) {
            console.error('Failed to create post', error);
            showToast('Failed to create post. Please try again.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} className="max-w-2xl">
            <ModalHeader
                title="Create Post"
                subtitle="Share your thoughts with the community."
                onClose={onClose}
            />

            <form onSubmit={handleCreatePost} className="space-y-6 p-8">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full min-h-[160px] resize-none input-standard"
                />

                {imagePreview && (
                    <div className="relative overflow-hidden rounded-xl border border-surface-border">
                        <img src={imagePreview} alt="Preview" className="w-full max-h-[300px] object-cover" />
                        <button
                            type="button"
                            onClick={() => {
                                setImage(null);
                                setImagePreview(null);
                            }}
                            className="absolute right-2 top-2 rounded-full bg-zinc-900/50 p-1.5 text-white hover:bg-zinc-900/70"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                <div className="flex items-center justify-between border-t border-surface-border pt-4">
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-surface-muted transition hover:bg-primary/5 hover:text-primary">
                        <ImageIcon size={20} />
                        <span>Add Photo</span>
                        <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                    </label>

                    <div className="flex items-center gap-3">
                        <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!content.trim() && !image}
                            isLoading={submitting}
                            loadingText="Posting..."
                        >
                            Post
                        </Button>
                    </div>
                </div>
            </form>
        </ModalWrapper>
    );
}
