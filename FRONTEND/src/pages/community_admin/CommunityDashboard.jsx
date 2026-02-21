import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import eventService from '../../services/eventService'
import announcementService from '../../services/announcementService'
import apiClient from '../../services/apiClient'
import { FeedItemSkeleton } from '../../components/feed/FeedItem'

export default function CommunityDashboard() {

  const { id } = useParams()
  const [menuOpen, setMenuOpen] = useState(false)
  const [community, setCommunity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [dashboardEvents, setDashboardEvents] = useState([])
  const [dashboardAnnouncements, setDashboardAnnouncements] = useState([])
  const [stats, setStats] = useState(null)

  const quickActions = [
    { label: 'View Events', path: `/community/${id}/manage/events`, icon: '🗓️' },
    { label: 'View Announcements', path: `/community/${id}/manage/announcements`, icon: '📢' },
    { label: 'Create Announcement', path: `/community/${id}/manage/announcements/create`, icon: '✍️' },
    { label: 'Create Event', path: `/community/${id}/manage/events/create`, icon: '➕' },
    { label: 'Start Discussion', path: `/discussions/create`, icon: '💬' },
    { label: 'Upload Resource', path: `/community/${id}?tab=Resources&action=upload`, icon: '📂' },
    { label: 'Manage Members', path: `/community/${id}/manage/members`, icon: '👥' },
    { label: 'Moderate Discussions', path: `/community/${id}/manage/moderation`, icon: '🛡️' },
  ]

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')

    const fetchCommunity = async () => {
      try {
        const [communityRes, eventsData, announcementsData, eventStats, announcementStats] = await Promise.all([
          apiClient.get(`/communities/dashboard/${id}/`),
          eventService.getEvents(id), // Fetch events for this community (page 1)
          announcementService.getAnnouncements(1, id), // Fetch announcements for this community (page 1)
          eventService.getEventStats(id),
          announcementService.getAnnouncementStats(id)
        ]);

        if (!mounted) return

        setCommunity(communityRes.data)

        // Handle paginated results
        setDashboardEvents(eventsData.results || [])
        setDashboardAnnouncements(announcementsData.results || [])

        setStats({
          members: communityRes.data.member_count,
          announcements: announcementStats.total_announcements,
          events: eventStats.total_events,
          upcomingEvents: eventStats.upcoming_events
        })

      } catch (err) {
        if (!mounted) return
        setError('Failed to load community data.')
        console.error(err)
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }

    fetchCommunity()
    return () => { mounted = false }
  }, [id])

  // Combine for Recent Activity
  const combinedActivity = [
    ...dashboardAnnouncements.map(a => ({
      id: `ann-${a.id}`,
      type: 'announcement',
      content: `Announcement: ${a.title}`,
      time: new Date(a.created_at).toLocaleDateString()
    })),
    ...dashboardEvents.map(e => ({
      id: `evt-${e.id}`,
      type: 'event',
      content: `Event: ${e.title}`,
      time: e.created_at ? new Date(e.created_at).toLocaleDateString() : 'Revently'
    }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5)


  if (loading) return (
    <div className="min-h-screen bg-[#f4f5f2] pt-24 pb-16">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="mb-8 flex items-center gap-4">
          <div className="h-36 w-36 rounded-full bg-gray-200 animate-pulse"></div>
          <div className="space-y-3">
            <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-10">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white rounded-3xl animate-pulse"></div>)}
        </div>
        <div className="space-y-6">
          <FeedItemSkeleton />
          <FeedItemSkeleton />
        </div>
      </div>
    </div>
  )
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>
  if (!community) return null

  const statCards = [
    { label: 'Total Members', value: (stats?.members || 0).toLocaleString(), change: 'Latest', trend: 'neutral' },
    { label: 'Announcements', value: (stats?.announcements || 0).toString(), change: 'Posted', trend: 'up' },
    { label: 'Events', value: (stats?.events || 0).toString(), change: 'Planned', trend: 'up' },
    { label: 'Upcoming Events', value: (stats?.upcomingEvents || 0).toString(), change: 'Future', trend: 'neutral' },
  ]

  return (
    <div className="min-h-screen bg-[#f4f5f2] text-[#0d1f14]">
      <Navbar
        menuOpen={menuOpen}
        toggleMenu={() => setMenuOpen((v) => !v)}
        closeMenu={() => setMenuOpen(false)}
        navSolid={true}
      />

      <main className="pt-24 pb-16">
        <div className="mx-auto w-full max-w-6xl px-4">
          <header className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {community?.community_logo ? (
                <div className="flex h-34 w-34 items-center justify-center rounded-full bg-white border-4 border-[#75C043] shadow-lg">
                  <img
                    src={community.community_logo}
                    alt={community.community_name}
                    className="h-30 w-30 rounded-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-36 w-36 items-center justify-center rounded-full bg-[#f4f5f2] text-4xl font-bold">
                  {(community?.community_name || 'CO').slice(0, 2).toUpperCase()}
                </div>
              )}

              <div>
                <h1 className="text-4xl font-extrabold">{community?.community_name} Dashboard</h1>
                <p className="mt-2 text-lg text-[#4b4b4b]">Manage your community</p>
              </div>

            </div>
            <Link to={`/community/${id}`} className="text-sm font-semibold text-[#75C043] hover:underline">
              View Public Page
            </Link>
          </header>

          {/* Stats Grid */}
          <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {statCards.map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
                <p className="text-3xl font-bold text-[#0d1f14]">{stat.value}</p>
                <p className="text-sm font-medium text-[#4b4b4b]">{stat.label}</p>
                <p className="mt-2 text-xs font-semibold text-green-600">
                  {stat.change}
                </p>
              </div>
            ))}
          </div>

          {/* Analytics Section */}
          <div className="mb-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Member Growth Chart */}
            <div className="rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
              <h3 className="mb-6 text-lg font-bold">Member Growth</h3>
              <div className="flex h-48 items-center justify-center text-gray-400">Chart Placeholder</div>
            </div>

            {/* Event Participation Chart */}
            <div className="rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
              <h3 className="mb-6 text-lg font-bold">Event Participation</h3>
              <div className="flex h-48 items-center justify-center text-gray-400">Chart Placeholder</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <h2 className="mb-6 text-xl font-bold">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {quickActions.map((action) => (
                  <Link
                    key={action.label}
                    to={action.path}
                    className="flex items-center gap-4 rounded-2xl border border-[#e5e7eb] bg-white p-6 transition hover:border-[#75C043] hover:shadow-md"
                  >
                    <span className="text-2xl">{action.icon}</span>
                    <span className="font-bold">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <aside>
              <h2 className="mb-6 text-xl font-bold">Recent Activity</h2>
              <div className="rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
                <div className="space-y-6">
                  {combinedActivity.length > 0 ? combinedActivity.map((activity) => (
                    <div key={activity.id} className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-[#75C043]">
                      <p className="text-sm font-medium text-[#0d1f14]">{activity.content}</p>
                      <p className="text-xs text-[#4b4b4b] mt-1">{activity.time}</p>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-500">No recent activity.</p>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}
