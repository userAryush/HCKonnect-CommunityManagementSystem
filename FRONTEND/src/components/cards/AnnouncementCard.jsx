import CommunityAvatar from '../shared/CommunityAvatar'

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function AnnouncementCard({ item }) {
  return (
    <article className="relative overflow-hidden rounded-3xl border border-[#e5e7eb] bg-[#fffcf5] p-5 shadow-sm transition hover:shadow-md">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#c08619]" />
      <div className="flex items-start gap-3">
        <CommunityAvatar name={item.community.name} logoText={item.community.logoText} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#0d1f14]">{item.community.name}</p>
              <p className="text-xs text-[#4b4b4b]">
                {item.author.name} • {timeAgo(item.createdAt)}
              </p>
            </div>
            <span className="rounded-full bg-[#FFF8DE] px-3 py-1 text-xs font-semibold text-[#c08619]">
              Announcement
            </span>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-[#0d1f14]">{item.title}</h3>
          <p className="mt-2 text-sm text-[#4b4b4b]">{item.description}</p>
        </div>
      </div>
    </article>
  )
}
