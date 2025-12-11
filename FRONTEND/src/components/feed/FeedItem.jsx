import { useState, useEffect } from 'react'

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export function FeedItemSkeleton() {
  return (
    <article className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-lg shadow-black/5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-[#e5e7eb]" />
        <div className="flex-1">
          <div className="h-3 w-24 rounded bg-[#e5e7eb]" />
          <div className="mt-2 h-2 w-40 rounded bg-[#e5e7eb]" />
        </div>
        <div className="h-6 w-16 rounded bg-[#e5e7eb]" />
      </div>
      <div className="mt-4 h-4 w-3/5 rounded bg-[#e5e7eb]" />
      <div className="mt-2 h-3 w-full rounded bg-[#e5e7eb]" />
      <div className="mt-2 h-3 w-4/5 rounded bg-[#e5e7eb]" />
      <div className="mt-4 flex gap-3">
        <div className="h-8 w-20 rounded-full bg-[#e5e7eb]" />
        <div className="h-8 w-20 rounded-full bg-[#e5e7eb]" />
        <div className="h-8 w-20 rounded-full bg-[#e5e7eb]" />
      </div>
    </article>
  )
}

export default function FeedItem({ item }) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(item.likes || 0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  function toggleLike() {
    setLiked((v) => !v)
    setLikes((n) => (liked ? Math.max(0, n - 1) : n + 1))
  }

  async function share() {
    const text = `${item.community.name} • ${item.title}`
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: 'HCKonnect', text, url })
      } else {
        await navigator.clipboard.writeText(url)
        alert('Link copied')
      }
    } catch { void 0 }
  }

  const typeLabel = {
    announcement: 'Announcement',
    event: 'Event',
    discussion: 'Discussion',
    resource: 'Resource',
    post: 'Post',
  }[item.type]

  const pillColor =
    item.type === 'announcement'
      ? 'bg-[#FFF8DE] text-[#c08619]'
      : item.type === 'event'
        ? 'bg-[#75C043]/15 text-[#75C043]'
        : item.type === 'discussion'
          ? 'bg-[#0d1f14]/10 text-[#0d1f14]'
          : item.type === 'resource'
            ? 'bg-[#e5e7eb] text-[#4b4b4b]'
            : 'bg-[#f6fdf1] text-[#0d1f14]'

  return (
    <article
      className={`min-h-82 rounded-3xl border border-[#e5e7eb] bg-[#fdfdfc] p-5 shadow-lg shadow-black/5 transition duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
    >
      <header className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0d1f14] text-white"
          aria-hidden
        >
          {item.community.logoText}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[#0d1f14]">{item.community.name}</p>
          <p className="text-xs text-[#4b4b4b]">{item.author} • {timeAgo(item.created_at)}</p>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${pillColor}`}>
          {typeLabel}
        </span>
      </header>

      {item.title ? <h3 className="mt-4 text-lg font-semibold text-[#0d1f14]">{item.title}</h3> : null}
      <p className="mt-2 text-sm text-[#4b4b4b]">{item.description}</p>

      {item.type === 'post' ? (
        <div className="mt-4 flex items-center gap-2">
          <button
            className={`rounded-full px-4 py-2 text-sm font-semibold transition border ${liked
              ? 'border-[#75C043] bg-[#75C043] text-[#0f1a12] shadow-md shadow-[#75C043]/40'
              : 'border-[#e5e7eb] bg-white text-[#0d1f14] hover:border-[#75C043]/50'
              }`}
            onClick={toggleLike}
            aria-label="Like"
          >
            ♥ {likes}
          </button>
          <button className="rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-semibold text-[#0d1f14] hover:border-[#75C043]/50">
            💬 {item.comments}
          </button>
          <button
            className="rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-semibold text-[#0d1f14] hover:border-[#75C043]/50"
            onClick={share}
            aria-label="Share"
          >
            ↗ Share
          </button>
        </div>
      ) : null}
    </article>
  )
}
