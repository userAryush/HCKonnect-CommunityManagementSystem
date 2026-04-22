import React from 'react';
import { Plus } from 'lucide-react';
import Button from './Button';

export default function CreateButton({ children, className = '', ...props }) {
    return (
        <Button
            className={`flex items-center gap-2 px-5 py-2.5 ${className}`}
            {...props}
        >
            <Plus size={18} />
            <span>{children}</span>
        </Button>
    );
}
