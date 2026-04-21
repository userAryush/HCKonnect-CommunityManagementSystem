import React from 'react';
import Button from '../shared/Button';
import ModalWrapper from './ModalWrapper';
import ModalHeader from './ModalHeader';

export default function ApplicantMessageModal({ isOpen, onClose, applicant }) {
    if (!isOpen || !applicant) return null;

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} className="max-w-xl">
            <ModalHeader
                title="Cover Letter"
                subtitle={`From: ${applicant.full_name}`}
                onClose={onClose}
            />
            <div className="p-8">
                <div className="card-border !rounded-2xl text-sm leading-relaxed text-surface-body whitespace-pre-wrap max-h-96 overflow-y-auto">
                    {applicant.message}
                </div>
                <Button onClick={onClose} variant="secondary" className="mt-6 w-full">
                    Close
                </Button>
            </div>
        </ModalWrapper>
    );
}