import { useEffect, useRef, useState } from 'react'
import FeedItem, { FeedItemSkeleton } from './FeedItem'
import { fetchFeed } from '../../services/feedApi'

export default function FeedList({ filter = 'all', hiddenTypes = [], hiddenCommunities = [] }) {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [nextPage, setNextPage] = useState(2)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const sentinelRef = useRef(null)



  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!hasMore || loading) return
      setLoading(true)
      const { results, nextPage: np } = await fetchFeed({ page, filter, hiddenTypes, hiddenCommunities })
      if (!cancelled) {
        setItems((prev) => {
          const merged = [...prev, ...results]
          merged.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          return merged
        })
        setHasMore(Boolean(np))
        setNextPage(np || null)
        setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [page, filter, hiddenTypes.join(','), hiddenCommunities.join(','), hasMore])

  useEffect(() => {
    if (!sentinelRef.current) return
    const io = new IntersectionObserver((entries) => {
      const [entry] = entries
      if (entry.isIntersecting && hasMore && !loading) {
        if (nextPage) setPage(nextPage)
      }
    })
    io.observe(sentinelRef.current)
    return () => io.disconnect()
  }, [hasMore, loading, nextPage])

  const skeletonCount = loading && items.length === 0 ? 6 : loading ? 3 : 0

  return (
    <div className="grid gap-4 sm:gap-6 md:grid-cols-1">
      {items.map((item) => (
        <FeedItem key={item.id} item={item} />
      ))}
      {Array.from({ length: skeletonCount }).map((_, i) => (
        <FeedItemSkeleton key={`sk-${i}`} />
      ))}
      {hasMore ? <div ref={sentinelRef} className="h-6" /> : null}
    </div>
  )
}
