import { useEffect, useState } from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';
import discussionService from '../service/discussionService';
import { useToast } from '../../../shared/components/ui/ToastContext';
import Button from '../../../shared/components/ui/Button';
import Dropdown from '../../../shared/components/ui/Dropdown';
import ModalWrapper from '../../../shared/components/modals/ModalWrapper';
import ModalHeader from '../../../shared/components/modals/ModalHeader';
import getApiErrorMessage from '../../../utils/getApiErrorMessage';
import LimitedTextarea from '../../../shared/components/ui/LimitedTextarea';
import { DESCRIPTION_MAX_LENGTH } from '../../../shared/constants/descriptionLimits';
import { clampToMaxLength } from '../../../utils/descriptionUtils';

const DISCUSSION_AI_ACTIONS = [
    { action_type: 'improve', label: 'Improve writing' },
    { action_type: 'grammar', label: 'Fix grammar' },
    { action_type: 'concise', label: 'Shorten' },
    { action_type: 'expand', label: 'Expand' },
    { action_type: 'friendly', label: 'Friendlier tone' },
];

export default function CreateDiscussionModal({ isOpen, onClose, onCreated }) {
    const { showToast } = useToast();
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const isPlatform = Boolean(user?.is_platform_community);
    const hasMembership = !isPlatform && user && (
        user.role === 'community' ||
        (user.membership && ['representative', 'member'].includes(user.membership.role))
    );

    const [loading, setLoading] = useState(false);
    const [aiBusy, setAiBusy] = useState(false);
    const [formData, setFormData] = useState({
        topic: '',
        content: '',
        visibility: 'public',
    });

    useEffect(() => {
        if (!isOpen) {
            setLoading(false);
            setAiBusy(false);
            setFormData({ topic: '', content: '', visibility: 'public' });
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const next =
            name === 'content' ? clampToMaxLength(value, DESCRIPTION_MAX_LENGTH) : value;
        setFormData((prev) => ({ ...prev, [name]: next }));
    };

    const handleAiAssist = async (actionType) => {
        if (!formData.topic.trim()) {
            showToast('Add a topic first so the assist can stay on subject.', 'error');
            return;
        }
        if (!formData.content.trim()) {
            showToast('Add some content for the assist to refine.', 'error');
            return;
        }
        setAiBusy(true);
        try {
            const data = await discussionService.enhanceDiscussionText({
                topic: formData.topic,
                content: formData.content,
                action_type: actionType,
            });
            const next = data?.response?.trim();
            if (!next) {
                showToast('AI did not return text. Try again.', 'error');
                return;
            }
            setFormData((prev) => ({
                ...prev,
                content: clampToMaxLength(next, DESCRIPTION_MAX_LENGTH),
            }));
            showToast('Content updated — review before posting.', 'success');
        } catch (err) {
            console.error(err);
            showToast(getApiErrorMessage(err, 'AI assist failed.'), 'error');
        } finally {
            setAiBusy(false);
        }
    };

    const aiAssistActions = DISCUSSION_AI_ACTIONS.map((item) => ({
        label: item.label,
        onClick: () => void handleAiAssist(item.action_type),
        disabled: aiBusy || loading,
    }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...formData };
            const membershipCommunityId =
                user?.membership?.community_id ?? user?.membership?.community;
            if (membershipCommunityId) payload.community = membershipCommunityId;
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
        <ModalWrapper isOpen={isOpen} onClose={onClose} className="max-w-6xl">
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
                    <LimitedTextarea
                        label="Content"
                        value={formData.content}
                        onChange={(value) =>
                            setFormData((prev) => ({ ...prev, content: value }))
                        }
                        required
                        rows={5}
                        className="resize-none"
                        placeholder="Elaborate on your topic..."
                        helperText="AI assist refines your content using the topic as context (it does not write from scratch)."
                    />
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Dropdown
                            align="right"
                            actions={aiAssistActions}
                            trigger={
                                <button
                                    type="button"
                                    disabled={aiBusy || loading}
                                    className="inline-flex items-center gap-1.5 rounded-button border border-surface-border bg-white px-3 py-2 text-xs font-semibold text-surface-dark hover:bg-secondary disabled:opacity-50"
                                >
                                    <Sparkles size={14} aria-hidden />
                                    AI assist
                                    <ChevronDown size={14} aria-hidden />
                                </button>
                            }
                        />
                    </div>
                </div>

                {!isPlatform && (
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
                )}

                <div className="flex items-center justify-end gap-4 border-t border-surface-border pt-4">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={loading || aiBusy}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={loading} loadingText="Posting..." disabled={aiBusy}>
                        Post Discussion
                    </Button>
                </div>
            </form>
        </ModalWrapper>
    );
}
