import { useEffect, useState } from 'react';
import discussionService from '../service/discussionService';
import { useToast } from '../../../shared/components/ui/ToastContext';
import Button from '../../../shared/components/ui/Button';
import ModalWrapper from '../../../shared/components/modals/ModalWrapper';
import ModalHeader from '../../../shared/components/modals/ModalHeader';
import LimitedTextarea from '../../../shared/components/ui/LimitedTextarea';
import { DESCRIPTION_MAX_LENGTH } from '../../../shared/constants/descriptionLimits';
import { clampToMaxLength } from '../../../utils/descriptionUtils';

export default function EditDiscussionModal({ isOpen, onClose, discussion, onUpdated }) {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        topic: '',
        content: '',
    });

    useEffect(() => {
        if (isOpen && discussion) {
            setLoading(false);
            setFormData({
                topic: discussion.topic || '',
                content: discussion.content || '',
            });
        }
    }, [isOpen, discussion]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const next =
            name === 'content' ? clampToMaxLength(value, DESCRIPTION_MAX_LENGTH) : value;
        setFormData((prev) => ({ ...prev, [name]: next }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!discussion?.id) return;
        setLoading(true);
        try {
            const updated = await discussionService.updateDiscussion(discussion.id, formData);
            showToast('Discussion updated successfully.', 'success');
            if (onUpdated) onUpdated(updated);
            onClose();
        } catch (error) {
            console.error('Failed to update discussion', error);
            showToast('Failed to update discussion. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} className="max-w-6xl">
            <ModalHeader
                title="Edit Discussion"
                subtitle="Update your discussion details."
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
                    />
                </div>

                <LimitedTextarea
                    label="Content"
                    value={formData.content}
                    onChange={(value) =>
                        setFormData((prev) => ({ ...prev, content: value }))
                    }
                    required
                    rows={5}
                    className="resize-none"
                />

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
