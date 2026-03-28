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
    <div className="flex flex-col gap-8">
      <MiniProfileCard />

      {/* Recent Announcements Section */}
      <section className="w-full">
        <div className="flex items-center justify-between mb-4 border-b border-surface-border pb-2 px-1">
          <h3 className="text-metadata tracking-[0.05em] uppercase font-bold text-zinc-500">Recent News</h3>
          <Link to="/announcements" className="text-[11px] font-bold text-primary hover:text-primary-hover transition-colors">VIEW ALL</Link>
        </div>
        <div className="space-y-1">
          {announcements.length > 0 ? announcements.map(ann => (
            <div key={ann.id} className="group p-3 rounded-xl hover:bg-white border border-transparent hover:border-zinc-200 hover:shadow-sm transition-all">
              <h4 className="text-body font-semibold line-clamp-1 group-hover:text-primary transition-colors">{ann.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">{ann.community_name}</p>
                <span className="text-[10px] text-zinc-400 font-medium">• {formatTimeAgo(ann.created_at)}</span>
              </div>
            </div>
          )) : (
            <p className="text-metadata italic p-4 text-center">No new announcements lately.</p>
          )}
        </div>
      </section>
    </div>
  )
}
