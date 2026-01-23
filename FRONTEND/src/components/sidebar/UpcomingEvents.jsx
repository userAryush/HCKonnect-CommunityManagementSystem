import { upcomingEvents } from '../../data/feedItems'

export default function UpcomingEvents() {
  if (!upcomingEvents || upcomingEvents.length === 0) {
    return (
      <div className="rounded-3xl border border-[#e5e7eb] bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-[#4b4b4b]">No upcoming events</p>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-bold text-[#0d1f14]">Upcoming Events</h3>
      <div className="flex flex-col gap-4">
        {upcomingEvents.map((event) => (
          <div key={event.id} className="flex gap-3 border-b border-[#f4f5f2] pb-4 last:border-0 last:pb-0">
            <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-[#f4f5f2] text-[#0d1f14]">
              <span className="text-xs font-bold uppercase">{event.date.split(' ')[0]}</span>
              <span className="text-sm font-bold">{event.date.split(' ')[1]}</span>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-[#0d1f14] line-clamp-1">{event.title}</h4>
              <p className="text-xs text-[#4b4b4b]">{event.time} • {event.location}</p>
              <button className="mt-2 rounded-lg bg-[#0d1f14] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#0d1f14]/80">
                Register
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
