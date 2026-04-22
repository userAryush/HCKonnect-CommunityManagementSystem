import { useEffect, useState } from 'react';
import discussionService from '../service/discussionService';
import { useToast } from '../../../shared/components/ui/ToastContext';
import Button from '../../../shared/components/ui/Button';
import ModalWrapper from '../../../shared/components/modals/ModalWrapper';
import ModalHeader from '../../../shared/components/modals/ModalHeader';

export default function CreateDiscussionModal({ isOpen, onClose, onCreated }) {
    const { showToast } = useToast();
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const hasMembership = user && (
        user.role === 'community' ||
        (user.membership && ['representative', 'member'].includes(user.membership.role))
    );

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        topic: '',
        content: '',
        visibility: 'public',
    });

    useEffect(() => {
        if (!isOpen) {
            setLoading(false);
            setFormData({ topic: '', content: '', visibility: 'public' });
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...formData };
            if (user?.membership?.community) payload.community = user.membership.community;
            else if (user?.role === 'community') payload.community = user.id;

            await discussionService.createDiscussion(payload);
            showToast('Discussion created successfully.', 'success');
            if (onCreated) onCreated();
            onClose();
        } catch (error) {
            console.error('Failed to create discussion', error);
            showToast('Failed to post discussion. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose}>
            <ModalHeader
                title="Start Discussion"
                subtitle="Create a new conversation for your community."
                onClose={onClose}
            />

            <form onSubmit={handleSubmit} className="space-y-6 p-8">
                <div>
                    <label className="mb-2 block text-body text-surface-dark">Topic</label>
                    <input
                        type="text"
                        name="topic"
                        value={formData.topic}
                        onChange={handleChange}
                        required
                        className="w-full input-standard"
                        placeholder="What's on your mind?"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-body text-surface-dark">Content</label>
                    <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="w-full resize-none input-standard"
                        placeholder="Elaborate on your topic..."
                    />
                </div>

                <div>
                    <label className="mb-2 block text-body text-surface-dark">Visibility</label>
                    <select
                        name="visibility"
                        value={formData.visibility}
                        onChange={handleChange}
                        className="w-full input-standard"
                    >
                        <option value="public">Public</option>
                        <option value="private" disabled={!hasMembership}>
                            Private (Community Only) {!hasMembership ? '(Membership Required)' : ''}
                        </option>
                    </select>
                </div>

                <div className="flex items-center justify-end gap-4 border-t border-surface-border pt-4">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={loading} loadingText="Posting...">
                        Post Discussion
                    </Button>
                </div>
            </form>
        </ModalWrapper>
    );
}
