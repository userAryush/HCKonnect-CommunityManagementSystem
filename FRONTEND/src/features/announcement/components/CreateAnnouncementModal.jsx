import { useEffect, useState } from 'react';
import announcementService from '../service/announcementService';
import { useToast } from '../../../shared/components/ui/ToastContext';
import Button from '../../../shared/components/ui/Button';
import ModalWrapper from '../../../shared/components/modals/ModalWrapper';
import ModalHeader from '../../../shared/components/modals/ModalHeader';

export default function CreateAnnouncementModal({ isOpen, onClose, onCreated }) {
    const { showToast } = useToast();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [visibility, setVisibility] = useState('private');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setTitle('');
            setDescription('');
            setVisibility('private');
            setImage(null);
            setLoading(false);
        }
    }, [isOpen]);

    const handlePublish = async (e) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('visibility', visibility);
            if (image) formData.append('image', image);

            await announcementService.createAnnouncement(formData);
            showToast('Announcement posted successfully.', 'success');
            if (onCreated) onCreated();
            onClose();
        } catch (error) {
            console.error('Failed to create announcement', error);
            showToast('Failed to create announcement.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose}>
            <ModalHeader
                title="Create Announcement"
                subtitle="Share important updates with your community."
                onClose={onClose}
            />

            <form onSubmit={handlePublish} className="space-y-6 p-8">
                <div>
                    <label className="mb-2 block text-body text-surface-dark">Title *</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full input-standard"
                        placeholder="e.g. Club Fair Schedule Change"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-body text-surface-dark">Description *</label>
                    <textarea
                        rows="5"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full resize-none input-standard"
                        placeholder="Write your announcement here..."
                    />
                </div>

                <div>
                    <label className="mb-2 block text-body text-surface-dark">Image (Optional)</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files?.[0] || null)}
                        className="w-full text-sm text-surface-muted file:mr-4 file:rounded-button file:border-0 file:bg-secondary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-surface-dark hover:file:bg-zinc-100"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-body text-surface-dark">Visibility</label>
                    <select
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value)}
                        className="w-full input-standard"
                    >
                        <option value="private">Private (Community Only)</option>
                        <option value="public">Public</option>
                    </select>
                </div>

                <div className="flex items-center justify-end gap-4 border-t border-surface-border pt-4">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={loading} loadingText="Publishing...">
                        Publish Announcement
                    </Button>
                </div>
            </form>
        </ModalWrapper>
    );
}
