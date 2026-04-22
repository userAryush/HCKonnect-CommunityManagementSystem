import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import announcementService from '../../services/announcementService'
import MiniProfileCard from './MiniProfileCard'
import { formatTimeAgo } from '../../utils/timeFormatter'

export default function InfoRow() {
    const [announcements, setAnnouncements] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [announcementsResponse] = await Promise.all([
                    announcementService.getAnnouncements()
                ])
                const rawAnnouncements = announcementsResponse?.results || (Array.isArray(announcementsResponse) ? announcementsResponse : [])
                const recent = rawAnnouncements
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 3)
                setAnnouncements(recent)
            } catch (err) {
                console.error("Failed to fetch info row data", err)
            }
        }
        fetchData()
    }, [])

    return (
        <div className="flex flex-col gap-4">
            <MiniProfileCard />

            {/* Recent News Card */}
            <div className="bg-white rounded-standard border border-surface-border shadow-sm p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        {/* Green accent bar */}
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

                {/* News items */}
                <div className="space-y-0.5">
                    {announcements.length > 0 ? announcements.map((ann, i) => (
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