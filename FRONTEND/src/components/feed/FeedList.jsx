import { useEffect, useState } from 'react'
import { feedItems } from '../../data/feedItems'

import AnnouncementCard from '../cards/AnnouncementCard'
import EventCard from '../cards/EventCard'

import { FeedItemSkeleton } from './FeedItem'

export default function FeedList({
  filter = 'all',
  hiddenTypes = [],
  hiddenCommunities = [],
}) {
  const [displayItems, setDisplayItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      const filtered = feedItems
        .filter((item) => {
          if (hiddenTypes.includes(item.type)) return false
          if (hiddenCommunities.includes(item.community.name)) return false
          if (filter !== 'all' && item.type !== filter) return false
          return item.type === 'announcement' || item.type === 'event'
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

      setDisplayItems(filtered)
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [filter, hiddenTypes, hiddenCommunities])

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <FeedItemSkeleton />
        <FeedItemSkeleton />
        <FeedItemSkeleton />
      </div>
    )
  }

  if (displayItems.length === 0) {
    return (
      <div className="rounded-3xl border border-[#e5e7eb] bg-white p-10 text-center">
        <p className="text-[#4b4b4b]">No items found matching your filters.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {(() => {
        const firstAnnouncement = displayItems.find(item => item.type === 'announcement')
        const firstEvent = displayItems.find(item => item.type === 'event')
        const limitedItems = [firstAnnouncement, firstEvent].filter(Boolean)
        return limitedItems.map(item =>
          item.type === 'announcement' ? (
            <AnnouncementCard key={item.id} item={item} />
          ) : (
            <EventCard key={item.id} item={item} />
          )
        )
      })()}
    </div>
  )

}
