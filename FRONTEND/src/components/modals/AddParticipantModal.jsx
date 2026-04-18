import React, { useState } from 'react';
import { Mail, Plus } from 'lucide-react';
import Button from '../shared/Button';

export default function AddParticipantModal({ isOpen, onClose, onSubmit, isLoading }) {
    const [email, setEmail] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(email);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d1f14]/60 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md overflow-hidden rounded-[32px] bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-2xl font-bold text-[#0d1f14]">Add Participant</h3>
                            <p className="text-gray-500 mt-1 text-sm">Enter the student's email to add them.</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <Plus className="rotate-45" size={24} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1">Student Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="email"
                                required
                                placeholder="student@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#f8f9fa] border border-gray-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm outline-none focus:border-[#75C043] focus:bg-white transition-all shadow-sm"
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 italic px-1">Note: The student must be a registered member of HCKonnect.</p>
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
                            variant="secondary"
                            className="w-full !py-3.5"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}