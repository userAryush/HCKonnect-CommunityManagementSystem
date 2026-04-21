import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import Button from '../shared/Button';
import ModalWrapper from './ModalWrapper';
import ModalHeader from './ModalHeader';

export default function AddParticipantModal({ isOpen, onClose, onSubmit, isLoading }) {
    const [email, setEmail] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(email);
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} className="max-w-md">
            <ModalHeader
                title="Add Participant"
                subtitle="Enter the student's email to add them."
                onClose={onClose}
            />
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                    <label className="text-metadata uppercase tracking-wider px-1">Student Email</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-muted" size={18} />
                        <input
                            type="email"
                            required
                            placeholder="student@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full input-standard pl-12 text-metadata"
                        />
                    </div>
                    <p className="text-metadata italic px-1">Note: The student must be a registered member of HCKonnect.</p>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                    <Button
                        type="submit"
                        disabled={isLoading || !email}
                        isLoading={isLoading}
                        loadingText="Adding..."
                        className="w-full !py-3.5"
                    >
                        Add Participant
                    </Button>
                    <Button
                        type="button"
                        onClick={onClose}
                        variant="outline"
                        className="w-full !py-3.5"
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </ModalWrapper>
    );
}