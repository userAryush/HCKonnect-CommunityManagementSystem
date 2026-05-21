/**
 * Shared shell — matches CommunityProfileSkeleton (light, theme-aware bars on surface-card).
 * Use for every page-level loading block so light/dark stay consistent.
 */
const SKELETON_PANEL = 'rounded-2xl border border-surface-border/10 bg-[var(--surface-card)]';

export const Skeleton = ({ className = '', variant = 'rect' }) => {
    const baseClasses = 'animate-pulse bg-surface-border/50';
    const variants = {
        rect: 'rounded-xl',
        circle: 'rounded-full',
        text: 'rounded h-4 w-full',
        card: 'rounded-3xl h-64 w-full',
        avatar: 'rounded-full h-12 w-12',
    };

    return <div className={`${baseClasses} ${variants[variant] || ''} ${className}`} />;
};

export const CardSkeleton = () => (
    <div className={`${SKELETON_PANEL} p-6 shadow-sm mb-6`}>
        <div className="flex gap-4 items-center mb-4">
            <Skeleton variant="avatar" />
            <div className="space-y-2 flex-1">
                <Skeleton variant="text" className="w-1/3 h-5" />
                <Skeleton variant="text" className="w-1/4 h-3" />
            </div>
        </div>
        <Skeleton variant="text" className="mb-2" />
        <Skeleton variant="text" className="w-5/6" />
        <Skeleton variant="rect" className="h-40 mt-4 rounded-2xl" />
    </div>
);

export const DashboardStatsSkeleton = () => (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-10">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`${SKELETON_PANEL} p-6 shadow-sm`}>
                <Skeleton variant="text" className="w-2/3 h-8 mb-2" />
                <Skeleton variant="text" className="w-1/2 h-4" />
            </div>
        ))}
    </div>
);

export const DashboardVacancyCardSkeleton = () => (
    <div className={`${SKELETON_PANEL} flex flex-col gap-4 !p-5 lg:flex-row lg:items-center lg:justify-between shadow-sm`}>
        <div className="flex flex-grow w-full items-start gap-4">
            <Skeleton variant="rect" className="h-12 w-12 flex-shrink-0" />
            <div className="flex-1 space-y-3">
                <Skeleton variant="text" className="w-1/2 h-5" />
                <Skeleton variant="text" className="h-4 w-full" />
                <Skeleton variant="text" className="w-3/4 h-4" />
            </div>
        </div>
        <div className="flex flex-shrink-0 self-start lg:self-center">
            <Skeleton variant="rect" className="h-8 w-28" />
        </div>
    </div>
);

/** Community profile shell: header band + tab strip + overview blocks */
export const CommunityProfileSkeleton = ({ tabPlaceholders = 7 }) => (
    <div aria-busy="true" aria-label="Loading community profile">
        <div className={`${SKELETON_PANEL} p-8`}>
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
                <Skeleton variant="rect" className="h-20 w-20 flex-shrink-0 rounded-xl" />
                <div className="flex-1 space-y-3 pt-1">
                    <Skeleton variant="text" className="h-8 max-w-[12rem] rounded-lg" />
                    <Skeleton variant="text" className="h-4 w-32 max-w-[50%]" />
                </div>
            </div>
        </div>
        <div className="mt-8 flex gap-4 overflow-hidden border-b border-surface-border/70 pb-3">
            {Array.from({ length: tabPlaceholders }, (_, i) => (
                <Skeleton key={i} variant="text" className="h-4 w-20 shrink-0" />
            ))}
        </div>
        <div className="mt-6 space-y-4">
            <Skeleton variant="rect" className="h-36 w-full rounded-xl" />
            <Skeleton variant="rect" className="h-36 w-full rounded-xl" />
        </div>
    </div>
);

/** Community directory — showcase, platform band, browse list */
export const CommunitiesListSkeleton = () => (
    <div aria-busy="true" aria-label="Loading communities">
        <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col sm:flex-row">
                <div className="flex flex-shrink-0 flex-col items-center gap-4 bg-surface-muted-bg/50 px-8 py-10 sm:w-72 sm:py-12">
                    <Skeleton variant="rect" className="h-24 w-36 rounded-2xl" />
                    <Skeleton variant="text" className="h-4 w-28" />
                    <Skeleton variant="text" className="h-5 w-16 rounded-full" />
                </div>
                <div className="hidden w-px self-stretch bg-surface-border/40 sm:block" />
                <div className="flex flex-1 flex-col p-6 sm:p-8">
                    <Skeleton variant="text" className="mb-4 h-3 w-36" />
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="flex justify-center p-3">
                                <Skeleton variant="rect" className="h-12 w-16 rounded-xl" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        <section className="mt-10 w-full bg-white py-10 sm:py-12">
            <div className="mx-auto max-w-6xl px-6">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
                    <Skeleton variant="rect" className="h-24 w-36 flex-shrink-0 rounded-2xl" />
                    <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <Skeleton variant="text" className="h-7 w-48 max-w-full" />
                            <Skeleton variant="text" className="h-5 w-28 rounded-full" />
                        </div>
                        <Skeleton variant="text" className="h-4 w-full" />
                        <Skeleton variant="text" className="h-4 w-full" />
                        <Skeleton variant="text" className="h-4 w-4/5" />
                        <Skeleton variant="text" className="mt-2 h-4 w-32" />
                    </div>
                </div>
            </div>
        </section>

        <div className="mx-auto mt-10 max-w-6xl space-y-3 px-6">
            <Skeleton variant="text" className="mb-1 h-3 w-40" />
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-6 py-2">
                    <Skeleton variant="rect" className="h-12 w-16 flex-shrink-0 rounded-xl" />
                    <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton variant="text" className="h-4 w-2/5 max-w-[12rem]" />
                        <Skeleton variant="text" className="h-3 w-full" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const CommentSkeletonRows = ({ count = 2 }) => (
    <div className="mt-4 space-y-3 px-1" aria-busy="true" aria-label="Loading comments">
        {Array.from({ length: count }, (_, i) => (
            <div key={`sk-${i}`} className="flex gap-3">
                <Skeleton variant="circle" className="h-9 w-9 flex-shrink-0" />
                <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton variant="text" className="h-3 max-w-[40%] w-28" />
                    <Skeleton variant="text" className="h-3 w-full" />
                    <Skeleton variant="text" className="h-3 w-4/5 max-w-[85%]" />
                </div>
            </div>
        ))}
    </div>
);

/** Feed / list cards — same panel + bars as community profile */
export const FeedItemSkeleton = () => (
    <article className={`${SKELETON_PANEL} p-6`} aria-hidden="true">
        <div className="flex items-center gap-3">
            <Skeleton variant="circle" className="h-10 w-10 flex-shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
                <Skeleton variant="text" className="h-3 w-24" />
                <Skeleton variant="text" className="h-2 w-40" />
            </div>
            <Skeleton variant="rect" className="h-6 w-16 rounded-md" />
        </div>
        <Skeleton variant="text" className="mt-6 h-4 w-3/5" />
        <Skeleton variant="text" className="mt-3 h-3 w-full" />
        <Skeleton variant="text" className="mt-2 h-3 w-4/5" />
        <div className="mt-6 flex gap-3">
            <Skeleton variant="rect" className="h-9 w-20 rounded-full" />
            <Skeleton variant="rect" className="h-9 w-20 rounded-full" />
        </div>
    </article>
);

/** Community dashboard: header strip + stat grid + feed-style placeholders */
export const CommunityDashboardSkeleton = () => (
    <div className="mx-auto w-full max-w-6xl px-4">
        <div className="mb-8 flex items-center gap-4">
            <Skeleton variant="circle" className="h-36 w-36 flex-shrink-0" />
            <div className="space-y-3">
                <Skeleton variant="text" className="h-10 max-w-md rounded-xl" />
                <Skeleton variant="text" className="h-6 w-40 rounded-lg" />
            </div>
        </div>
        <DashboardStatsSkeleton />
        <div className="mt-6 space-y-6">
            <FeedItemSkeleton />
            <FeedItemSkeleton />
        </div>
    </div>
);

/** Post / discussion detail page shell while parent resource loads */
export const DetailPageLayoutSkeleton = () => (
    <div className="mx-auto max-w-6xl space-y-6 px-4">
        <div className={`${SKELETON_PANEL} p-8`}>
            <Skeleton variant="text" className="mb-4 h-9 max-w-lg rounded-lg" />
            <div className="space-y-2">
                <Skeleton variant="text" className="h-4 w-full" />
                <Skeleton variant="text" className="h-4 w-full" />
                <Skeleton variant="text" className="h-4 w-4/5" />
            </div>
            <Skeleton variant="rect" className="mt-6 h-52 w-full rounded-xl" />
        </div>
        <Skeleton variant="rect" className="h-28 w-full rounded-xl" />
    </div>
);
