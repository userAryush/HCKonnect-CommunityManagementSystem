import AnnouncementCard from '../../../announcement/components/AnnouncementCard';
import EventCard from '../../../events/components/shared/EventCard';
import DiscussionCard from '../../../discussion/components/DiscussionCard';
import PostCard from '../../../posts/components/PostCard';
import { Skeleton, CardSkeleton } from '../../../../shared/components/layout/Skeleton';
import ResourceCard from '../../../resource/components/ResourceCard';
import VacancyCard from '../../../vacancy/components/VacancyCard';

const GRID_LAYOUT = {
    Announcements: 'grid grid-cols-1 md:grid-cols-2 gap-6',
    Events: 'grid grid-cols-1 md:grid-cols-2 gap-6',
    Discussions: 'flex flex-col gap-4',
    Posts: 'grid grid-cols-1 gap-6',
    Resources: 'grid grid-cols-1 md:grid-cols-2 gap-6',
    Vacancies: 'grid grid-cols-1 md:grid-cols-2 gap-6',
};

export default function ContentGrid({ tab, data, loading, onApply, onDelete, onEdit }) {
    const layoutClass = GRID_LAYOUT[tab] || 'flex flex-col gap-4';

    if (loading) {
        const isGrid = layoutClass.startsWith('grid');

        return (
            <div className="rounded-xl bg-secondary p-6">
                <div className={isGrid ? layoutClass : layoutClass}>
                    {tab === 'Discussions' ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="space-y-3 py-2">
                                <Skeleton variant="text" className="w-1/4 h-4" />
                                <Skeleton variant="text" className="w-3/4 h-6" />
                                <Skeleton variant="text" className="w-1/2 h-4" />
                            </div>
                        ))
                    ) : (
                        [1, 2, 3, 4].map(i => <CardSkeleton key={i} />)
                    )}
                </div>
            </div>
        );
    }

    const CardComponent = {
        Announcements: AnnouncementCard,
        Events: EventCard,
        Discussions: DiscussionCard,
        Posts: PostCard,
        Resources: ResourceCard,
        Vacancies: VacancyCard,
    }[tab];

    const itemProp = {
        Announcements: 'item',
        Events: 'item',
        Discussions: 'item',
        Posts: 'post',
        Resources: 'resource',
        Vacancies: 'vacancy',
    }[tab];

    return (
        <div className="rounded-xl bg-secondary p-6">
            {data.length === 0 ? (
                <p className="py-10 text-center text-surface-muted">No {tab.toLowerCase()} found.</p>
            ) : (
                <div className={layoutClass}>
                    {data.map((item) => (
                        <CardComponent
                            key={item.id}
                            {...{ [itemProp]: item }}
                            onApply={onApply}
                            {...(onDelete ? { onDelete } : {})}
                            {...(onEdit ? { onEdit } : {})}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
