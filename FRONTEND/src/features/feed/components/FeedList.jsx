import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AnnouncementCard from '../../announcement/components/AnnouncementCard'
import EventCard from '../../events/components/shared/EventCard'
import { FeedItemSkeleton } from './FeedItem'
import eventService from '../../events/service/eventService'
import announcementService from '../../announcement/service/announcementService'
import discussionService from '../../discussion/service/discussionService'
import postService from '../../posts/service/postService'
import DiscussionCard from '../../discussion/components/DiscussionCard'
import PostCard from '../../posts/components/PostCard'
import VacancyCard from '../../vacancy/components/VacancyCard'
import Card from '../../../shared/components/ui/Card'
import vacancyService from '../../vacancy/service/vacancyService'


const EMPTY_ARRAY = [];

export default function FeedList({
  filter = 'all',
  hiddenTypes = EMPTY_ARRAY,
  hiddenCommunities = EMPTY_ARRAY,
  onApplyClick = () => { },
}) {
  const [displayItems, setDisplayItems] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [eventsData, announcementsData, discussionsData, postsData, vacanciesData] = await Promise.all([
          eventService.getEvents().catch(err => { console.error("Events fetch error", err); return { results: [] }; }),
          announcementService.getAnnouncements().catch(err => { console.error("Announcements fetch error", err); return { results: [] }; }),
          discussionService.getDiscussions().catch(err => { console.error("Discussions fetch error", err); return { results: [] }; }),
          postService.getPosts().catch(err => { console.error("Posts fetch error", err); return { results: [] }; }),
          vacancyService.getVacancies(null, { status: 'OPEN' }).catch(err => { console.error("Vacancies fetch error", err); return []; })
        ]);

        const events = eventsData.results || [];
        const announcements = announcementsData.results || [];

        const mappedEvents = Array.isArray(events) ? events.map(e => ({
          ...e,
          type: 'event',
          id: e.id,
          createdAt: e.created_at || new Date().toISOString(),
          author_name: e.community_name || 'Community',
          author_image: e.community_logo || null,
          author_role: 'community',
          eventMeta: {
            date: e.date,
            time: e.start_time,
            location: e.location
          },
          registered_count: e.registered_count || 0,
          max_participants: e.max_participants,
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
          author_name: a.community_name || 'Community',
          author_image: a.community_logo || null,
          author_role: 'community',
          community: {
            name: a.community_name || 'Community',
            logoText: (a.community_name || 'CO').substring(0, 2).toUpperCase()
          }
        })) : [];

        const discussions = discussionsData.results || [];
        const mappedDiscussions = Array.isArray(discussions) ? discussions.map(d => ({
          ...d,
          type: 'discussion',
          id: d.id,
          createdAt: d.created_at,
          author_name: d.author_name || 'User',
          author_image: d.author_image || null,
          author_role: d.author_role || 'student',
          community: {
            name: d.community_name || 'Community',
            logoText: (d.community_name || 'CO').substring(0, 2).toUpperCase()
          },
        })) : [];

        const posts = postsData.results || [];
        const mappedPosts = Array.isArray(posts) ? posts.map(p => ({
          ...p,
          type: 'post',
          id: p.id,
          createdAt: p.created_at,
          author_name: p.author_name || 'User',
          author_image: p.author_image || null,
          author_role: p.author_role || 'student'
        })) : [];

        const vacancies = vacanciesData || [];
        const mappedVacancies = Array.isArray(vacancies) ? vacancies.map(v => ({
          ...v,
          type: 'vacancy',
          id: v.id,
          createdAt: v.created_at || new Date().toISOString(),
          community: {
            name: v.community_name || 'Community',
            logoText: (v.community_name || 'CO').substring(0, 2).toUpperCase()
          }
        })) : [];

        const allItems = [...mappedEvents, ...mappedAnnouncements, ...mappedDiscussions, ...mappedPosts, ...mappedVacancies]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
      <div className="flex flex-col gap-4">
        <FeedItemSkeleton />
        <FeedItemSkeleton />
        <FeedItemSkeleton />
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

  return (
    <div className="flex flex-col gap-4">
      {displayItems.map(item => {
        if (item.type === 'announcement') return <AnnouncementCard key={`ann-${item.id}`} item={item} />
        if (item.type === 'discussion') return <DiscussionCard key={`disc-${item.id}`} item={item} />
        if (item.type === 'post') return <PostCard key={`post-${item.id}`} post={item} />
        if (item.type === 'vacancy') return (
          <VacancyCard
            key={`vac-${item.id}`}
            vacancy={item}
            onApply={onApplyClick}
          />
        )
        return <EventCard key={`evt-${item.id}`} item={item} />
      })}
    </div>
  )
}
