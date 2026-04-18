import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '../shared/Button';

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isLoading = false,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-300 rounded-2xl bg-white p-6 text-center shadow-2xl">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-surface-dark">{title}</h3>
                <p className="text-sm text-surface-body">{message}</p>
                <div className="mt-6 flex justify-center gap-4">
                    <Button variant="secondary" onClick={onClose} className="w-full">
                        {cancelText}
                    </Button>
                    <Button
                        variant="danger-outline"
                        onClick={onConfirm}
                        isLoading={isLoading}
                        loadingText="Closing..."
                        className="w-full bg-red-600 hover:bg-red-700-text-secondary focus:ring-red-500/50"
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
}