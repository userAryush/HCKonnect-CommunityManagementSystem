import { Link } from 'react-router-dom';
import { Briefcase, Users, Calendar } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';

// Utility function to format date in YYYY/MM/DD format
const formatDate = (dateString) => {
    if (!dateString) return null;

    try {
        const date = new Date(dateString);
        // Check if date is valid
        if (isNaN(date.getTime())) return null;

        // Format as YYYY/MM/DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}/${month}/${day}`;
    } catch (error) {
        console.error('Date formatting error:', error);
        return null;
    }
};

const DashboardVacancyCard = ({ vacancy, communityId, onAction, isActionLoading = false, onDelete, showDescription = false }) => {
    const { id, title, description, is_open, applicant_count } = vacancy;


    // Extract dates with multiple fallback field names
    const openedDate = vacancy.created_at;
    const closedDate = vacancy.updated_at;

    // Format dates
    const formattedOpenedDate = formatDate(openedDate);
    const formattedClosedDate = formatDate(closedDate);

    return (
        <div className="card-border flex flex-col gap-4 !p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4 flex-grow">
                <div className={`p-3 rounded-xl flex items-center justify-center ${is_open ? 'bg-primary/10 text-primary' : 'bg-red-50 text-red-500'}`}>
                    <Briefcase size={20} />
                </div>
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-bold text-surface-dark">{title}</h2>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${is_open ? 'bg-primary/10 text-primary' : 'bg-red-50 text-red-500'}`}>
                            {is_open ? 'Open' : 'Closed'}
                        </span>
                    </div>
                    {showDescription && description && (
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-surface-body">
                            {description}
                        </p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-surface-muted">
                        <div className="flex items-center gap-2 font-semibold">
                            <Users size={14} />
                            {applicant_count || 0} applicants
                        </div>

                        {/* Always show Opened Date */}
                        <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            <span>Opened: {formattedOpenedDate || 'Date not available'}</span>
                        </div>

                        {/* Show Closed Date only for closed vacancies */}
                        {!is_open && (
                            <div className="flex items-center gap-1">
                                <Calendar size={12} />
                                <span>Closed: {formattedClosedDate || 'Date not available'}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-shrink-0 flex-wrap items-center gap-2 self-start lg:self-center">
                <Link to={`/community/${communityId}/vacancies/${id}/applicants`}>
                    <Button variant="secondary" className="!px-3 !py-1.5 !text-xs">
                        View Applicants
                    </Button>
                </Link>
                {is_open && onAction && (
                    <Button
                        variant="danger-outline"
                        onClick={() => onAction(vacancy)}
                        disabled={isActionLoading}
                        isLoading={isActionLoading}
                        loadingText="Closing..."
                        className="!px-3 !py-1.5 !text-xs"
                    >
                        Close
                    </Button>
                )}
                {!is_open && onDelete && (
                    <Button
                        variant="danger-outline"
                        onClick={() => onDelete(vacancy)}
                        className="!px-3 !py-1.5 !text-xs"
                    >
                        Delete
                    </Button>
                )}
            </div>
        </div>
    );
};

export default DashboardVacancyCard;