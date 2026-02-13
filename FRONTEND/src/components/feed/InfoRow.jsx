import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import eventService from '../../services/eventService'
import announcementService from '../../services/announcementService'
import MiniProfileCard from './MiniProfileCard'

export default function InfoRow() {
  const [events, setEvents] = useState([])
  const [announcements, setAnnouncements] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsResponse, announcementsResponse] = await Promise.all([
          eventService.getEvents(),
          announcementService.getAnnouncements()
        ])

        // 1. Safe parsing for Events (checks for .results or direct array)
        const rawEvents = eventsResponse?.results || (Array.isArray(eventsResponse) ? eventsResponse : [])
        const upcoming = rawEvents
          .filter(e => new Date(e.date) >= new Date())
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 3) // Changed to 3
        setEvents(upcoming)

        // 2. Safe parsing for Announcements
        const rawAnnouncements = announcementsResponse?.results || (Array.isArray(announcementsResponse) ? announcementsResponse : [])
        const recent = rawAnnouncements
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 3) // Changed to 3
        setAnnouncements(recent)

      } catch (err) {
        console.error("Failed to fetch info row data", err)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="flex flex-col gap-10">
      <MiniProfileCard />
      {/* Upcoming Events Section */}
      <section>
        <div className="flex items-center justify-between mb-5 border-b border-gray-200/60 pb-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Upcoming Events</h3>
          <Link to="/events" className="text-[10px] font-bold text-[#75C043] hover:underline">VIEW ALL</Link>
        </div>
        <div className="space-y-5">
          {events.length > 0 ? events.map(event => (
            <Link to={`/events/${event.id}`} key={event.id} className="group block">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center shadow-sm group-hover:border-[#75C043] transition-all group-hover:shadow-md">
                  <span className="text-[9px] font-bold text-gray-400 uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-base font-black text-[#0d1f14] leading-none">{new Date(event.date).getDate()}</span>
                </div>
                <div className="overflow-hidden pt-1">
                  <h4 className="text-sm font-bold text-[#0d1f14] line-clamp-1 group-hover:text-[#75C043] transition-colors">{event.title}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{event.start_time}</p>
                </div>
              </div>
            </Link>
          )) : (
            <p className="text-xs italic text-gray-400">No upcoming events.</p>
          )}
        </div>
      </section>

      {/* Recent Announcements Section */}
      <section>
        <div className="flex items-center justify-between mb-5 border-b border-gray-200/60 pb-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Recent News</h3>
          <Link to="/announcements" className="text-[10px] font-bold text-[#75C043] hover:underline">VIEW ALL</Link>
        </div>
        <div className="space-y-3">
          {announcements.length > 0 ? announcements.map(ann => (
            <div key={ann.id} className="group p-4 bg-white/40 rounded-2xl border border-transparent hover:border-gray-200/60 hover:bg-white hover:shadow-sm transition-all cursor-pointer">
              <h4 className="text-sm font-bold text-[#0d1f14] line-clamp-1 group-hover:text-[#75C043]">{ann.title}</h4>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="w-1 h-1 rounded-full bg-[#75C043]"></span>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{ann.community_name}</p>
              </div>
            </div>
          )) : (
            <p className="text-xs italic text-gray-400">No new announcements.</p>
          )}
        </div>
      </section>
    </div>
  )
}