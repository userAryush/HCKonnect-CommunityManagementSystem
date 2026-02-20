import { useEffect, useState } from 'react'
import AnnouncementCard from '../cards/AnnouncementCard'
import EventCard from '../cards/EventCard'
import { FeedItemSkeleton } from './FeedItem'
import eventService from '../../services/eventService'
import announcementService from '../../services/announcementService'
import discussionService from '../../services/discussionService'
import postService from '../../services/postService'
import DiscussionCard from '../cards/DiscussionCard'
import PostCard from '../cards/PostCard'

export default function FeedList({
  filter = 'all',
  hiddenTypes = [],
  hiddenCommunities = [],
}) {
  const [displayItems, setDisplayItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [eventsData, announcementsData, discussionsData, postsData] = await Promise.all([
          eventService.getEvents().catch(err => { console.error("Events fetch error", err); return { results: [] }; }),
          announcementService.getAnnouncements().catch(err => { console.error("Announcements fetch error", err); return { results: [] }; }),
          discussionService.getDiscussions().catch(err => { console.error("Discussions fetch error", err); return { results: [] }; }),
          postService.getPosts().catch(err => { console.error("Posts fetch error", err); return { results: [] }; })
        ]);

        const events = eventsData.results || [];
        const announcements = announcementsData.results || [];

        const mappedEvents = Array.isArray(events) ? events.map(e => ({
          ...e,
          type: 'event',
          id: e.id,
          createdAt: e.created_at || new Date().toISOString(), // Fallback
          // Adapter for EventCard
          eventMeta: {
            date: e.date,
            time: e.start_time, // Using start_time as primary time
            location: e.location
          },
          stats: {
            registrations: { current: 0, capacity: 100 } // Mock stats if not provided
          },
          community: {
            name: e.community_name || 'Community',
            logoText: (e.community_name || 'CO').substring(0, 2).toUpperCase()
          }
        })) : [];

        const mappedAnnouncements = Array.isArray(announcements) ? announcements.map(a => ({
          ...a,
          type: 'announcement',
          id: a.id,
          createdAt: a.created_at,
          // Adapter for AnnouncementCard
          community: {
            name: a.community_name || 'Community',
            logoText: (a.community_name || 'CO').substring(0, 2).toUpperCase()
          },
          author: {
            name: a.uploaded_by || 'Admin'
          }
        })) : [];

        const discussions = discussionsData.results || [];
        const mappedDiscussions = Array.isArray(discussions) ? discussions.map(d => ({
          ...d,
          type: 'discussion',
          id: d.id,
          createdAt: d.created_at,
          // Adapter if needed, but DiscussionCard expects 'item' which matches 'd'
          community: {
            name: d.community_name || 'Community', // discussions endpoint should provide this
            logoText: (d.community_name || 'CO').substring(0, 2).toUpperCase()
          },
        })) : [];

        const posts = postsData.results || [];
        const mappedPosts = Array.isArray(posts) ? posts.map(p => ({
          ...p,
          type: 'post',
          id: p.id,
          createdAt: p.created_at,
          author: {
            name: p.author_name || 'User'
          }
        })) : [];

        const allItems = [...mappedEvents, ...mappedAnnouncements, ...mappedDiscussions, ...mappedPosts]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Apply local filtering (if needed beyond backend filtering)
        const finalFiltered = allItems.filter((item) => {
          if (hiddenTypes.includes(item.type)) return false
          if (item.community?.name && hiddenCommunities.includes(item.community.name)) return false
          if (filter !== 'all' && item.type !== filter) return false
          return true
        })

        setDisplayItems(finalFiltered)

      } catch (error) {
        console.error("Failed to fetch feed", error);
      } finally {
        setLoading(false)
      }
    };

    fetchData();
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
      {displayItems.map(item => {
        if (item.type === 'announcement') return <AnnouncementCard key={`ann-${item.id}`} item={item} />
        if (item.type === 'discussion') return <DiscussionCard key={`disc-${item.id}`} item={item} />
        if (item.type === 'post') return <PostCard key={`post-${item.id}`} post={item} />
        return <EventCard key={`evt-${item.id}`} item={item} />
      })}
    </div>
  )
}
