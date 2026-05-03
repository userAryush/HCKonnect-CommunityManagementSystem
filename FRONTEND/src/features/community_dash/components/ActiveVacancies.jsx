import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import DashboardVacancyCard from '../../vacancy/components/DashboardVacancyCard';

export default function ActiveVacancies({
    communityId,
    vacancies,
    vacanciesLoading,
    onAction,
    vacancyActionLoadingId,
}) {
    const openVacancies = vacancies.filter((v) => v.is_open);

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-title">Active Vacancies</h3>
                <Link
                    to={`/community/${communityId}/manage/vacancies/list`}
                    className="text-xs font-bold text-surface-muted hover:text-primary"
                >
                    View Closed
                </Link>
            </div>
            <div className="space-y-4">
                {vacanciesLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="animate-spin text-primary" size={24} />
                    </div>
                ) : openVacancies.length > 0 ? (
                    openVacancies.slice(0, 3).map((v) => (
                        <DashboardVacancyCard
                            key={v.id}
                            vacancy={v}
                            communityId={communityId}
                            onAction={onAction}
                            showDescription={false}
                            isActionLoading={vacancyActionLoadingId === v.id}
                        />
                    ))
                ) : (
                    <div className="card-border text-center text-surface-muted !py-8">No active vacancies.</div>
                )}
            </div>
        </div>
    );
}
