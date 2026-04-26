import { useEffect, useState } from 'react';
import announcementService from '../service/announcementService';
import { useToast } from '../../../shared/components/ui/ToastContext';
import Button from '../../../shared/components/ui/Button';
import ModalWrapper from '../../../shared/components/modals/ModalWrapper';
import ModalHeader from '../../../shared/components/modals/ModalHeader';

export default function EditAnnouncementModal({ isOpen, onClose, announcement, onUpdated }) {
    const { showToast } = useToast();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && announcement) {
            setTitle(announcement.title || '');
            setDescription(announcement.description || '');
            setLoading(false);
        }
    }, [isOpen, announcement]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!announcement?.id) return;
        if (!title.trim() || !description.trim()) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);

            const updated = await announcementService.updateAnnouncement(announcement.id, formData);
            showToast('Announcement updated successfully.', 'success');
            if (onUpdated) onUpdated(updated);
            onClose();
        } catch (error) {
            console.error('Failed to update announcement', error);
            showToast('Failed to update announcement.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose}>
            <ModalHeader
                title="Edit Announcement"
                subtitle="Update announcement details."
                onClose={onClose}
            />

            <form onSubmit={handleUpdate} className="space-y-6 p-8">
                <div>
                    <label className="mb-2 block text-body text-surface-dark">Title *</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full input-standard"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-body text-surface-dark">Description *</label>
                    <textarea
                        rows="5"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full resize-none input-standard"
                    />
                </div>

                {announcement?.image && (
                    <div className="rounded-xl overflow-hidden border border-surface-border">
                        <img src={announcement.image} alt="Current announcement" className="w-full max-h-64 object-cover" />
                    </div>
                )}
                <p className="text-xs text-surface-muted">Image editing is disabled for announcements.</p>

                <p className="text-xs text-surface-muted">Visibility cannot be changed after creation.</p>

                <div className="flex items-center justify-end gap-4 border-t border-surface-border pt-4">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={loading} loadingText="Saving...">
                        Save Changes
                    </Button>
                </div>
            </form>
        </ModalWrapper>
    );
}
