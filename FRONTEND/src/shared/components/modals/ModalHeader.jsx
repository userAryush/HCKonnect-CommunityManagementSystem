import React from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button';

const ModalHeader = ({ title, subtitle, onClose }) => {
    return (
        <div className="flex items-start justify-between border-b border-surface-border px-8 py-6 rounded-t-3xl">
            <div>
                <h2 className="text-title text-2xl">{title}</h2>
                {subtitle && <p className="mt-1 text-sm text-surface-body">{subtitle}</p>}
            </div>
            {onClose && (
                <Button
                    variant="ghost"
                    onClick={onClose}
                    className="!absolute top-5 right-5 !h-10 !w-10 !p-0"
                >
                    <X size={20} />
                </Button>
            )}
        </div>
    );
};

export default ModalHeader;