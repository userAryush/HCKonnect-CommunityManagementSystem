import React from 'react';
import { X } from 'lucide-react';
import Button from '../shared/Button';

export default function ApplicantMessageModal({ isOpen, onClose, applicant }) {
    if (!isOpen || !applicant) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d1f14]/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-xl bg-white rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-2xl font-bold">Cover Letter</h3>
                        <p className="text-sm text-gray-500 mt-1">From: {applicant.full_name}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl text-sm leading-relaxed text-gray-600 whitespace-pre-wrap max-h-96 overflow-y-auto">
                    {applicant.message}
                </div>
                <Button onClick={onClose} variant="secondary" className="mt-6 w-full">
                    Close
                </Button>
            </div>
        </div>
    );
}