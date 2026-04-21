export const Skeleton = ({ className = '', variant = 'rect' }) => {
    const baseClasses = 'animate-pulse bg-surface-border/50 shimmer'
    const variants = {
        rect: 'rounded-xl',
        circle: 'rounded-full',
        text: 'rounded h-4 w-full',
        card: 'rounded-3xl h-64 w-full',
        avatar: 'rounded-full h-12 w-12'
    }

    return (
        <div className={`${baseClasses} ${variants[variant] || ''} ${className}`} />
    )
}

export const CardSkeleton = () => (
    <div className="rounded-3xl border border-surface-border bg-white p-6 shadow-sm mb-6">
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
)

export const DashboardStatsSkeleton = () => (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-10">
        {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-3xl border border-surface-border bg-white p-6 shadow-sm">
                <Skeleton variant="text" className="w-2/3 h-8 mb-2" />
                <Skeleton variant="text" className="w-1/2 h-4" />
            </div>
        ))}
    </div>
)

export const DashboardVacancyCardSkeleton = () => (
    <div className="card-border flex flex-col gap-4 !p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4 flex-grow w-full">
            <Skeleton variant="rect" className="h-12 w-12 flex-shrink-0" />
            <div className="flex-1 space-y-3">
                <Skeleton variant="text" className="w-1/2 h-5" />
                <Skeleton variant="text" className="w-full h-4" />
                <Skeleton variant="text" className="w-3/4 h-4" />
            </div>
        </div>
        <div className="flex-shrink-0 self-start lg:self-center">
            <Skeleton variant="rect" className="h-8 w-28" />
        </div>
    </div>
);

export const TableSkeleton = ({ rows = 5, columns = 6 }) => (
    <div className="bg-white rounded-[32px] border border-surface-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-secondary/30 border-b border-surface-border">
                        {[...Array(columns)].map((_, i) => (
                            <th key={i} className="px-8 py-5">
                                <Skeleton variant="text" className="h-3 w-12" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                    {[...Array(rows)].map((_, i) => (
                        <tr key={i}>
                            <td className="px-8 py-5"><Skeleton variant="text" className="h-4 w-4" /></td>
                            <td className="px-8 py-5"><Skeleton variant="text" className="h-4 w-32" /></td>
                            <td className="px-8 py-5"><Skeleton variant="text" className="h-4 w-48" /></td>
                            <td className="px-8 py-5"><Skeleton variant="rect" className="h-5 w-20 rounded-md" /></td>
                            <td className="px-8 py-5"><Skeleton variant="text" className="h-4 w-24" /></td>
                            <td className="px-8 py-5 flex justify-end"><Skeleton variant="rect" className="h-8 w-20 rounded-lg" /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);
