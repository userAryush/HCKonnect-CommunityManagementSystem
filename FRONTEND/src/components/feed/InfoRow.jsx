import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import eventService from '../../services/eventService'
import announcementService from '../../services/announcementService'

export default function InfoRow() {
  const [events, setEvents] = useState([])
  const [announcements, setAnnouncements] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsData, announcementsData] = await Promise.all([
          eventService.getEvents(),
          announcementService.getAnnouncements()
        ])

        const upcoming = (Array.isArray(eventsData) ? eventsData : [])
          .filter(e => new Date(e.date) >= new Date())
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 2) // Limit to 2
        setEvents(upcoming)

        const recent = (Array.isArray(announcementsData) ? announcementsData : [])
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 2) // Limit to 2
        setAnnouncements(recent)
      } catch (err) {
        console.error("Failed to fetch info row data", err)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

      {/* Clean Events Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#e5e7eb] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#75C043]"></span>
            <h3 className="text-sm font-bold text-[#0d1f14] uppercase tracking-wider">Upcoming Events</h3>
          </div>
          <Link to="/events" className="text-xs font-medium text-[#4b4b4b] hover:text-[#75C043]">See All</Link>
        </div>

        <div className="space-y-3">
          {events.length > 0 ? events.map((event) => {
            const dateObj = new Date(event.date || Date.now());
            return (
              <Link to={`/events/${event.id}`} key={event.id} className="group block">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-[#0d1f14] group-hover:text-[#75C043] transition-colors line-clamp-1">{event.title}</h4>
                    <p className="text-xs text-[#4b4b4b]">
                      {dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {event.start_time}
                    </p>
                  </div>
                  <div className="h-6 w-6 flex items-center justify-center rounded-full border border-gray-100 bg-gray-50 text-gray-400 group-hover:bg-[#75C043] group-hover:text-white group-hover:border-[#75C043] transition-all">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                  </div>
                </div>
              </Link>
            )
          }) : (
            <p className="text-xs text-gray-400 italic">No upcoming events right now.</p>
          )}
        </div>
      </div>

      {/* Clean Announcements Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#e5e7eb] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
            <h3 className="text-sm font-bold text-[#0d1f14] uppercase tracking-wider">Recent Announcements</h3>
          </div>
          <Link to="/announcements" className="text-xs font-medium text-[#4b4b4b] hover:text-[#75C043]">See All</Link>
        </div>

        <div className="space-y-3">
          {announcements.length > 0 ? announcements.map((ann) => (
            <div key={ann.id} className="group cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-[#0d1f14] group-hover:text-[#75C043] transition-colors line-clamp-1">{ann.title}</h4>
                  <p className="text-xs text-[#4b4b4b] line-clamp-1">{ann.community_name}</p>
                </div>
                <div className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-md">
                  {new Date(ann.created_at).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' })}
                </div>
              </div>
            </div>
          )) : (
            <p className="text-xs text-gray-400 italic">No new announcements.</p>
          )}
        </div>
      </div>

    </div>
  )
}
