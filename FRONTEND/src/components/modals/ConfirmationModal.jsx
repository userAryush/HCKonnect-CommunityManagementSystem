import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '../shared/Button';
import ModalWrapper from './ModalWrapper';

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isLoading = false,
    loadingText = 'Processing...',
}) {
    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} className="max-w-md">
            <div className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50/50">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="mb-2 text-title">{title}</h3>
                <p className="text-body">{message}</p>
                <div className="mt-6 flex justify-center gap-4">
                    <Button variant="secondary" onClick={onClose} className="w-full">
                        {cancelText}
                    </Button>
                    <Button
                        variant="danger-outline"
                        onClick={onConfirm}
                        isLoading={isLoading}
                        loadingText={loadingText}
                        className="w-full"
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </ModalWrapper>
    );
}