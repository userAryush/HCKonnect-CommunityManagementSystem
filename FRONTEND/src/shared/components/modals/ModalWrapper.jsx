import React from 'react';
import { createPortal } from 'react-dom';

const ModalWrapper = ({ isOpen, onClose, children, className = 'max-w-2xl' }) => {
    if (!isOpen) return null;

    return createPortal((
        <div
            className="fixed inset-0 z-[120] flex items-start sm:items-center justify-center overflow-y-auto bg-surface-dark/60 p-4 sm:p-6 backdrop-blur-sm animate-in fade-in"
            onClick={onClose}
        >
            <div
                className={`relative my-6 sm:my-0 w-full max-h-[calc(100vh-3rem)] overflow-y-auto rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-300 ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    ), document.body);
};

export default ModalWrapper;