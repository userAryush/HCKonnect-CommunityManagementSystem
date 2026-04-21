import React from 'react';

const ModalWrapper = ({ isOpen, onClose, children, className = 'max-w-2xl' }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-surface-dark/60 p-4 backdrop-blur-sm animate-in fade-in"
            onClick={onClose}
        >
            <div
                className={`relative w-full rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-300 ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
};

export default ModalWrapper;