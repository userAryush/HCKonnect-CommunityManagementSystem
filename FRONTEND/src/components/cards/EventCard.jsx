import React from 'react'
import { useNavigate } from 'react-router-dom'
import { formatTimeAgo } from '../../utils/timeFormatter'
import { getInitials, getDisplayName, getRoleLabel, getProfileImage } from '../../utils/userUtils'
import Card from '../shared/Card'
import Badge from '../shared/Badge'
import Button from '../shared/Button'

export default function EventCard({ item }) {
  const navigate = useNavigate()
  const { eventMeta, stats, id } = item
  const progress = stats?.registrations
    ? Math.round((stats.registrations.current / stats.registrations.capacity) * 100)
    : 0
  const dateObj = new Date(eventMeta?.date || Date.now());
  const month = dateObj.toLocaleString('default', { month: 'short' });
  const day = dateObj.getDate();

  return (
    <Card
      onClick={() => navigate(`/events/${id}`)}
      className="cursor-pointer group relative"
    >
      <div className="flex items-start justify-between mb-6">
        <header className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold overflow-hidden border border-zinc-200 uppercase text-xs tracking-wider">
            {getProfileImage(item) ? (
              <img src={getProfileImage(item)} alt={getDisplayName(item)} className="h-full w-full object-cover" />
            ) : (
              getInitials(getDisplayName(item))
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-surface-dark">{getDisplayName(item)}</p>
            <p className="text-metadata">
              {getRoleLabel(item)} • {formatTimeAgo(item.createdAt || item.created_at)}
            </p>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center rounded-xl bg-secondary border border-surface-border px-3 py-2 ml-4 min-w-[56px] h-fit">
          <span className="text-xl font-bold text-primary leading-none tracking-tighter">{day}</span>
          <span className="text-[10px] font-bold uppercase text-surface-muted mt-1 tracking-widest">{month}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="gray">Event</Badge>
        </div>
        <h3 className="text-title group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        <p className="text-metadata font-medium mt-1">
          📍 {eventMeta?.location} • {eventMeta?.time}
        </p>
      </div>

      <p className="mt-4 text-body line-clamp-2 leading-relaxed">
        {item.description}
      </p>

      <div className="mt-6 pt-6 border-t border-surface-border/50">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-surface-muted">Registration Progress</span>
          <span className="text-xs font-semibold text-surface-dark">{stats?.registrations?.current || 0} / {stats?.registrations?.capacity || 100}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full bg-primary transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex gap-3 mt-8">
          <Button
            variant="secondary"
            className="flex-1 py-1.5 !text-xs"
            onClick={(e) => { e.stopPropagation(); navigate(`/events/${id}`); }}
          >
            Details
          </Button>
          <Button
            variant="primary"
            className="flex-1 py-1.5 !text-xs"
            onClick={(e) => { e.stopPropagation(); navigate(`/events/${id}`); }}
          >
            Register Now
          </Button>
        </div>
      </div>
    </Card>
  )
}
