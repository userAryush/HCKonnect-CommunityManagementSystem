import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const BackLink = ({ to, text, className = '' }) => {
    return (
        <Link
            to={to}
            className={`inline-flex items-center gap-1 text-sm font-semibold text-surface-muted transition-colors hover:text-primary ${className}`}
        >
            <ChevronLeft size={16} />
            Back to {text}
        </Link>
    );
};

export default BackLink;