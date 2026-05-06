import { useEffect, useState } from 'react';
import Button from '../../../../shared/components/ui/Button';
import ModalHeader from '../../../../shared/components/modals/ModalHeader';
import ModalWrapper from '../../../../shared/components/modals/ModalWrapper';
import eventService from '../../service/eventService';

export default function EventRegistrationModal({
    isOpen,
    onClose,
    eventId,
    event,
    currentUser,
    onRegistered,
    onError,
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        course: '',
        semester: '',
        studentId: '',
        comments: '',
    });

    useEffect(() => {
        if (!isOpen) return;
        setFormData({
            fullName: `${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`.trim(),
            email: currentUser?.email || '',
            course: currentUser?.course || '',
            semester: currentUser?.semester || '',
            studentId: currentUser?.student_id || '',
            comments: '',
        });
    }, [isOpen, currentUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await eventService.registerForEvent(eventId, {});
            onRegistered?.();
            onClose?.();
        } catch (error) {
            const errorMsg =
                error.response?.data?.detail || 'Registration failed. Please try again.';
            onError?.(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} className="max-w-2xl">
            <ModalHeader
                title={`Register for ${event?.title || 'this event'}`}
                subtitle={`${event?.date || ''} ${event?.start_time ? `at ${event.start_time}` : ''}`}
                onClose={onClose}
            />
            <form onSubmit={handleSubmit} className="space-y-6 p-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-bold text-[#0d1f14]">Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            required
                            value={formData.fullName}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 text-sm outline-none focus:border-[#75C043]"
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-bold text-[#0d1f14]">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 text-sm outline-none focus:border-[#75C043]"
                            placeholder="john@university.edu"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div>
                        <label className="mb-2 block text-sm font-bold text-[#0d1f14]">Course</label>
                        <input
                            type="text"
                            name="course"
                            required
                            value={formData.course}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 text-sm outline-none focus:border-[#75C043]"
                            placeholder="e.g. B.Tech CSE"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-bold text-[#0d1f14]">Semester</label>
                        <input
                            type="number"
                            name="semester"
                            required
                            value={formData.semester}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 text-sm outline-none focus:border-[#75C043]"
                            placeholder="e.g. 6"
                            min="1"
                            max="8"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-bold text-[#0d1f14]">Student ID</label>
                        <input
                            type="text"
                            name="studentId"
                            required
                            value={formData.studentId}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 text-sm outline-none focus:border-[#75C043]"
                            placeholder="12345678"
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-bold text-[#0d1f14]">Additional Comments (Optional)</label>
                    <textarea
                        name="comments"
                        rows="3"
                        value={formData.comments}
                        onChange={handleChange}
                        className="w-full resize-none rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 text-sm outline-none focus:border-[#75C043]"
                        placeholder="Any questions or special requirements?"
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="w-full !rounded-xl !py-3.5"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        isLoading={isSubmitting}
                        loadingText="Confirming..."
                        className="w-full !rounded-xl !py-3.5"
                    >
                        Confirm Registration
                    </Button>
                </div>
            </form>
        </ModalWrapper>
    );
}
