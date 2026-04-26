import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import AnnouncementCard from '../../announcement/components/AnnouncementCard'
import EventCard from '../../events/components/shared/EventCard'
import { FeedItemSkeleton } from './FeedItem'
import DiscussionCard from '../../discussion/components/DiscussionCard'
import PostCard from '../../posts/components/PostCard'
import VacancyCard from '../../vacancy/components/VacancyCard'
import Card from '../../../shared/components/card/Card'
import { useInView } from 'react-intersection-observer'
import { fetchFeed } from '../service/feedApi'


const EMPTY_ARRAY = [];

export default function FeedList({
  filter = 'all',
  hiddenTypes = EMPTY_ARRAY,
  hiddenCommunities = EMPTY_ARRAY,
  onApplyClick = () => { },
}) {
  const PAGE_SIZE = 20
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isFetching, setIsFetching] = useState(true)
  const [isFetchingNext, setIsFetchingNext] = useState(false)
  const [fetchError, setFetchError] = useState(null)
  const { ref: sentinelRef, inView } = useInView({
    rootMargin: '220px 0px',
    threshold: 0,
  })

  const displayItems = useMemo(() => {
    return items.filter((item) => {
      if (hiddenTypes.includes(item.type)) return false
      if (item.community?.name && hiddenCommunities.includes(item.community.name)) return false
      return true
    })
  }, [items, hiddenTypes, hiddenCommunities])

  const fetchPage = useCallback(async (targetPage, isNextPage = false) => {
    if (isNextPage) {
      setIsFetchingNext(true)
    } else {
      setIsFetching(true)
    }
    setFetchError(null)

    try {
      const data = await fetchFeed({
        page: targetPage,
        pageSize: PAGE_SIZE,
        filter,
      })
      const fetchedItems = data.results || []

      setItems((prev) => (isNextPage ? [...prev, ...fetchedItems] : fetchedItems))
      setHasMore(data.next !== null)
      setPage(targetPage)
    } catch (error) {
      console.error('Failed to fetch feed', error)
      setFetchError('Failed to load more.')
    } finally {
      if (isNextPage) {
        setIsFetchingNext(false)
      } else {
        setIsFetching(false)
      }
    }
  }, [filter])

  useEffect(() => {
    setItems([])
    setPage(1)
    setHasMore(true)
    fetchPage(1, false)
  }, [filter, fetchPage])

  useEffect(() => {
    if (!inView || !hasMore || isFetching || isFetchingNext || fetchError) return
    fetchPage(page + 1, true)
  }, [inView, hasMore, isFetching, isFetchingNext, fetchError, page, fetchPage])

  if (isFetching && items.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: PAGE_SIZE }).map((_, idx) => (
          <FeedItemSkeleton key={`feed-skeleton-${idx}`} />
        ))}
      </div>
    )
  }

  if (displayItems.length === 0) {
    return (
      <Card className="p-12 text-center bg-zinc-50/50 border-dashed shadow-none">
        <p className="text-surface-muted text-sm font-medium">No updates found matching your filters.</p>
      </Card>
    )
  }

  const sentinelIndex = Math.min(
    displayItems.length - 1,
    Math.floor(displayItems.length * 0.85)
  )

  return (
    <div className="flex flex-col gap-4">
      {displayItems.map((item, index) => {
        const keyPrefix = item.type || 'item'
        return (
          <Fragment key={`${keyPrefix}-${item.id}`}>
            {item.type === 'announcement' && <AnnouncementCard item={item} />}
            {item.type === 'discussion' && <DiscussionCard item={item} />}
            {item.type === 'post' && <PostCard post={item} />}
            {item.type === 'vacancy' && (
              <VacancyCard
                vacancy={item}
                onApply={onApplyClick}
              />
            )}
            {item.type === 'event' && <EventCard item={item} />}
            {index === sentinelIndex && <div ref={sentinelRef} className="h-1 w-full opacity-0" />}
          </Fragment>
        )
      })}

      {isFetchingNext && (
        <div className="flex justify-center py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-primary" />
        </div>
      )}

      {fetchError && (
        <div className="flex justify-center py-4">
          <button
            onClick={() => fetchPage(page + 1, true)}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Failed to load more - Retry
          </button>
        </div>
      )}

      {!hasMore && (
        <div className="py-6 text-center text-sm font-medium text-surface-muted">
          You&apos;re all caught up
        </div>
      )}
    </div>
  )
}
