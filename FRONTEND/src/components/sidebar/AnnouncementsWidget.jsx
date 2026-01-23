import { Link } from 'react-router-dom'

// Mock announcements data (replace with real data source)
const recentAnnouncements = [
  {
    id: 'a1',
    title: 'Mid-Semester Break Schedule',
    community: 'Student Council',
    date: '1 day ago',
  },
  {
    id: 'a2',
    title: 'Library Maintenance Update',
    community: 'Admin',
    date: '3 days ago',
  },
]

export default function AnnouncementsWidget() {
  return (
    <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#0d1f14]">Announcements</h3>
        <Link to="#announcements" className="text-xs font-semibold text-[#75C043] hover:underline">View More</Link>
      </div>
      <div className="flex flex-col gap-4">
        {recentAnnouncements.slice(0, 2).map((announcement) => (
          <div key={announcement.id} className="border-b border-[#f4f5f2] pb-4 last:border-0 last:pb-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-[#75C043]">{announcement.community}</span>
              <span className="text-[10px] text-[#4b4b4b]">• {announcement.date}</span>
            </div>
            <h4 className="text-sm font-semibold text-[#0d1f14] line-clamp-2 hover:text-[#75C043] cursor-pointer">
              {announcement.title}
            </h4>
          </div>
        ))}
      </div>
    </div>
  )
}
