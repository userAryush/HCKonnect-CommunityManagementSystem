export const Skeleton = ({ className = '', variant = 'rect' }) => {
    const baseClasses = 'animate-pulse bg-gray-200/80 shimmer'
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
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm mb-6">
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
            <div key={i} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <Skeleton variant="text" className="w-2/3 h-8 mb-2" />
                <Skeleton variant="text" className="w-1/2 h-4" />
            </div>
        ))}
    </div>
)
