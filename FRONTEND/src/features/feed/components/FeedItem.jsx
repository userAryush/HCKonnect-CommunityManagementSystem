import { useState, useEffect } from 'react'
import { formatTimeAgo } from '../../../utils/timeFormatter'
import Card from '../../../shared/components/card/Card'
import Badge from '../../../shared/components/ui/Badge'
import Button from '../../../shared/components/ui/Button'

export function FeedItemSkeleton() {
  return (
    <article className="card-border animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-zinc-100" />
        <div className="flex-1">
          <div className="h-3 w-24 rounded bg-zinc-100" />
          <div className="mt-2 h-2 w-40 rounded bg-zinc-100" />
        </div>
        <div className="h-6 w-16 rounded bg-zinc-100" />
      </div>
      <div className="mt-6 h-4 w-3/5 rounded bg-zinc-100" />
      <div className="mt-3 h-3 w-full rounded bg-zinc-100" />
      <div className="mt-2 h-3 w-4/5 rounded bg-zinc-100" />
      <div className="mt-6 flex gap-3">
        <div className="h-9 w-20 rounded-full bg-zinc-100" />
        <div className="h-9 w-20 rounded-full bg-zinc-100" />
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

  return (
    <Card
      className={`transition duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
    >
      <header className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 font-bold"
          aria-hidden
        >
          {item.community.logoText || (item.community.name ? item.community.name[0] : 'C')}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-surface-dark">{item.community.name}</p>
          <p className="text-metadata">{item.author} • {formatTimeAgo(item.created_at)}</p>
        </div>
        <Badge variant={item.type === 'event' || item.type === 'announcement' ? 'success' : 'gray'}>
          {typeLabel}
        </Badge>
      </header>

      <div className="mt-4">
        {item.title ? <h3 className="text-title mb-2">{item.title}</h3> : null}
        <p className="text-body leading-relaxed">{item.description}</p>
      </div>

      {item.type === 'post' || item.type === 'discussion' ? (
        <div className="mt-6 flex items-center gap-3">
          <Button
            variant="secondary"
            className={`rounded-full px-4 py-1.5 !text-xs gap-2 ${liked ? 'border-primary text-primary bg-primary/5' : ''}`}
            onClick={toggleLike}
          >
            <span className={liked ? 'text-primary' : 'text-zinc-400'}>♥</span> {likes}
          </Button>
          <Button
            variant="secondary"
            className="rounded-full px-4 py-1.5 !text-xs gap-2"
          >
            <span className="text-zinc-400">💬</span> {item.comments || 0}
          </Button>
          <Button
            variant="secondary"
            className="rounded-full px-4 py-1.5 !text-xs gap-2 ml-auto"
            onClick={share}
          >
            <span className="text-zinc-400">↗</span> Share
          </Button>
        </div>
      ) : null}
    </Card>
  )
}
