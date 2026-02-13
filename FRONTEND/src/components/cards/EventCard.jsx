import CommunityAvatar from '../shared/CommunityAvatar'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { formatTimeAgo } from '../../utils/timeFormatter'

export default function EventCard({ item }) {
  const navigate = useNavigate()
  const { eventMeta, stats, id } = item
  const progress = stats?.registrations
    ? Math.round((stats.registrations.current / stats.registrations.capacity) * 100)
    : 0
  const dateObj = new Date(eventMeta?.date || Date.now());
  const month = dateObj.toLocaleString('default', { month: 'short' });
  const day = dateObj.getDate();
  const dateString = dateObj.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div
      onClick={() => navigate(`/events/${id}`)}
      className="group relative flex h-[400px] cursor-pointer flex-col overflow-hidden rounded-3xl bg-white text-[#0d1f14] shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
    >
      <div className="flex bg-[#0d1f14] p-5 text-white">
        <div className="absolute top-4 right-20">
          <span className="rounded-full bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
            Event
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-80">
            <span>{formatTimeAgo(eventMeta?.date)}</span>
            <span>•</span>
            <span>{eventMeta?.time}</span>
          </div>
          <h3 className="mt-1 text-xl font-semibold">{item.title}</h3>
          <p className="mt-1 text-sm opacity-80">📍 {eventMeta?.location}</p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl bg-white/10 px-3 py-1 backdrop-blur-sm">
          <span className="text-2xl font-bold">{day}</span>
          <span className="text-xs uppercase">{month}</span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-3">
          <CommunityAvatar name={item.community.name} logoText={item.community.logoText} size="sm" />
          <p className="text-sm font-medium text-[#0d1f14]">Hosted by {item.community.name}</p>
        </div>

        <p className="mt-3 text-sm text-[#4b4b4b]">{item.description}</p>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#4b4b4b]">
            <span>Registration</span>
            <span>{stats?.registrations?.current} / {stats?.registrations?.capacity} registered</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#e5e7eb]">
            <div
              className="h-full bg-[#75C043] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex gap-3 mt-4">
            <Link
              to={`/events/${item.id}`}
              className="block w-full rounded-xl border border-[#e5e7eb] bg-white py-3 text-center text-sm font-bold text-[#4b4b4b] transition hover:bg-[#f4f5f2]"
            >
              View Details
            </Link>
            <Link
              to={`/events/${item.id}`}
              className="block w-full rounded-xl bg-[#75C043] py-3 text-center text-sm font-bold text-[#0f1a12] shadow-lg shadow-[#75C043]/30 transition hover:scale-[1.02]"
            >
              Register Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
