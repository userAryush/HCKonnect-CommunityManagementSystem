import AnnouncementCard from '../../../announcement/components/AnnouncementCard';
import EventCard from '../../../events/components/shared/EventCard';
import DiscussionCard from '../../../discussion/components/DiscussionCard';
import PostCard from '../../../posts/components/PostCard';
import { Skeleton, CardSkeleton } from '../../../../shared/components/layout/Skeleton';
import ResourceCard from '../../../resource/components/ResourceCard';
import VacancyCard from '../../../vacancy/components/VacancyCard';

// Reusable Soft Container Component
const SoftContainer = ({ children, className = '' }) => (
    <div className={`community-soft-card bg-[var(--surface-card)] border border-surface-border/10 rounded-xl p-5 ${className}`}>
        {children}
    </div>
);

export default function ContentGrid({ tab, data, loading, onApply }) {
    if (loading) {
        const gridClasses = {
            Announcements: "grid-cols-1 md:grid-cols-2",
            Events: "grid-cols-1 md:grid-cols-2",
            Discussions: "space-y-4",
            Posts: "grid-cols-1",
            Resources: "grid-cols-1 md:grid-cols-2",
            Vacancies: "grid-cols-1 md:grid-cols-2",
        }[tab];

        const isGrid = gridClasses.startsWith('grid');

        return (
            <SoftContainer className="!p-6">
                <div className={isGrid ? `grid ${gridClasses} gap-6` : gridClasses}>
                    {tab === 'Discussions' ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="border border-surface-border/60 rounded-2xl p-5 space-y-3">
                                <Skeleton variant="text" className="w-1/4 h-4" />
                                <Skeleton variant="text" className="w-3/4 h-6" />
                                <Skeleton variant="text" className="w-1/2 h-4" />
                            </div>
                        ))
                    ) : (
                        [1, 2, 3, 4].map(i => <CardSkeleton key={i} />)
                    )}
                </div>
            </SoftContainer>
        );
    }

    const gridClasses = {
        Announcements: "grid-cols-1 md:grid-cols-2",
        Events: "grid-cols-1 md:grid-cols-2", // Changed to 2 per row
        Discussions: "space-y-4",
        Posts: "grid-cols-1", // Posts are typically full-width
        Resources: "grid-cols-1 md:grid-cols-2", // Set to 2 per row
        Vacancies: "grid-cols-1 md:grid-cols-2",
    };

    const CardComponent = {
        Announcements: AnnouncementCard,
        Events: EventCard,
        Discussions: DiscussionCard,
        Posts: PostCard, // Add PostCard
        Resources: ResourceCard, // Add ResourceCard
        Vacancies: VacancyCard,
    }[tab];

    const itemProp = {
        Announcements: 'item',
        Events: 'item',
        Discussions: 'item',
        Posts: 'post', // Match PostCard prop name
        Resources: 'resource', // ResourceCard expects a 'resource' prop
        Vacancies: 'vacancy',
    }[tab];

    return (
        <SoftContainer className="!p-6">
            {data.length === 0 ? (
                <div className={`col-span-full py-10 text-center text-surface-muted`}>No {tab.toLowerCase()} found.</div>
            ) : (
                <div className={gridClasses[tab].startsWith('grid') ? `grid ${gridClasses[tab]} gap-6` : gridClasses[tab]}>
                    {data.map((item) => (
                        <CardComponent
                            key={item.id}
                            {...{ [itemProp]: item }}
                            onApply={onApply}
                        />
                    ))}
                </div>
            )}
        </SoftContainer>
    );
}