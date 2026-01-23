import { Link } from 'react-router-dom'
import { upcomingEvents } from '../../data/feedItems'

// Mock announcements data
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

export default function InfoRow() {
  const displayEvents = upcomingEvents.slice(0, 3)

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-8">
      {/* Card 1: Upcoming Events */}
      <div className="rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-sm h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#0d1f14]">Upcoming Events</h3>
          <Link to="/events" className="text-xs font-semibold text-[#75C043] hover:underline">View More</Link>
        </div>
        <div className="flex flex-col gap-4">
          {displayEvents.map((event) => (
            <div key={event.id} className="flex gap-3 border-b border-[#f4f5f2] pb-3 last:border-0 last:pb-0">
              <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-[#f4f5f2] text-[#0d1f14]">
                <span className="text-[10px] font-bold uppercase">{event.date.split(' ')[0]}</span>
                <span className="text-xs font-bold">{event.date.split(' ')[1]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-[#0d1f14] truncate">{event.title}</h4>
                <p className="text-xs text-[#4b4b4b] truncate">{event.time} • {event.location}</p>
              </div>
              <Link
                to={`/events/${event.id}`}
                className="self-center rounded-lg bg-[#0d1f14] px-3 py-1.5 text-[10px] font-semibold text-white transition hover:bg-[#0d1f14]/80"
              >
                Register
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Card 2: Announcements */}
      <div className="rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-sm h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#0d1f14]">Announcements</h3>
          <Link to="#announcements" className="text-xs font-semibold text-[#75C043] hover:underline">View More</Link>
        </div>
        <div className="flex flex-col gap-4">
          {recentAnnouncements.map((announcement) => (
            <div key={announcement.id} className="border-b border-[#f4f5f2] pb-3 last:border-0 last:pb-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-[#75C043] px-2 py-0.5 rounded-full bg-[#75C043]/10">
                  {announcement.community}
                </span>
                <span className="text-[10px] text-[#4b4b4b]">• {announcement.date}</span>
              </div>
              <h4 className="text-sm font-semibold text-[#0d1f14] line-clamp-2 hover:text-[#75C043] cursor-pointer">
                {announcement.title}
              </h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
