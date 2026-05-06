import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

/**
 * History-based back control. Uses navigate(-1) when session history has a prior entry;
 * otherwise navigates to `to` (default /feed).
 */
const BackLink = ({ to = '/feed', className = '' }) => {
    const navigate = useNavigate();

    const handleClick = useCallback(() => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
            navigate(-1);
        } else {
            navigate(to);
        }
    }, [navigate, to]);

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`group inline-flex items-center gap-1.5 rounded-lg py-1.5 pl-1 pr-2 text-sm font-semibold text-surface-muted transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary active:scale-[0.98] ${className}`}
            aria-label="Go back"
        >
            <ChevronLeft size={16} className="shrink-0 transition-transform group-hover:-translate-x-0.5" aria-hidden />
            Back
        </button>
    );
};

export default BackLink;
