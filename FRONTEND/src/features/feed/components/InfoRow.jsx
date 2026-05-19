import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import MiniProfileCard from './MiniProfileCard'
import { formatTimeAgo } from '../../../utils/timeFormatter'

export default function InfoRow({
    announcements: announcementsProp = null,
    profile = null,
    isFeedLoading = false,
}) {
    const announcements = useMemo(() => {
        if (!Array.isArray(announcementsProp)) return []
        return [...announcementsProp]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 3)
    }, [announcementsProp])

    return (
        <div className="flex flex-col gap-4">
            <MiniProfileCard profile={profile} isFeedLoading={isFeedLoading} />

            <div className="bg-white rounded-standard border border-surface-border shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="block rounded-full bg-primary"
                            style={{ width: '3px', height: '16px' }} />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-surface-muted">
                            Recent News
                        </h3>
                    </div>
                    <Link to="/announcements"
                        className="text-[11px] font-medium text-primary hover:underline">
                        View all
                    </Link>
                </div>

                <div className="space-y-0.5">
                    {isFeedLoading ? (
                        <p className="text-metadata italic text-center py-4">Loading announcements…</p>
                    ) : announcements.length > 0 ? announcements.map((ann) => (
                        <div key={ann.id}
                            className="group flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-primary/10">
                            <div className="min-w-0 flex-1">
                                <p
                                    className="text-sm font-medium text-surface-dark leading-snug line-clamp-1 transition-colors"
                                    style={{ fontSize: '12.5px' }}>
                                    {ann.title}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-metadata font-semibold uppercase tracking-tight" style={{ fontSize: '10px' }}>
                                        {ann.community_name}
                                    </span>
                                    <span className="text-surface-border">·</span>
                                    <span className="text-metadata" style={{ fontSize: '10px' }}>
                                        {formatTimeAgo(ann.created_at)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <p className="text-metadata italic text-center py-4">No new announcements lately.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
