import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useParams, useLocation } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import eventService from '../../services/eventService'
import announcementService from '../../services/announcementService'
import apiClient from '../../services/apiClient'
import { FeedItemSkeleton } from '../../components/feed/FeedItem'
import {
  Calendar,
  FileDown,
  Users,
  ExternalLink,
  Bell,
  Eye,
  TrendingUp,
  PieChart

} from 'lucide-react'


export default function CommunityDashboard() {

  const { id } = useParams()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [community, setCommunity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [dashboardEvents, setDashboardEvents] = useState([])
  const [dashboardAnnouncements, setDashboardAnnouncements] = useState([])
  const [stats, setStats] = useState(null)

  const quickActions = [
    { label: 'Post Notice', path: `/community/${id}/manage/announcements/create`, icon: <Bell size={20} /> },
    { label: 'Schedule Event', path: `/community/${id}/manage/events/create`, icon: <Calendar size={20} /> },
    { label: 'Manage Members', path: `/community/${id}/manage/members`, icon: <Users size={20} /> },
    { label: 'Export Engagement Report', path: `#`, icon: <FileDown size={20} /> },
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

  const statCards = [
    {
      label: 'Total Members',
      value: stats?.members || 0,
      meta: '+ 3 New Members'
    },
    {
      label: 'Resource Utility',
      value: stats?.downloads || 128,
      meta: 'Materials accessed this week'
    },
    {
      label: 'Upcoming Events',
      value: stats?.upcomingEvents || 42,
      meta: 'Committed to upcoming events'
    },
    {
      label: 'Community Engagements',
      value: (stats?.posts || 0) + (stats?.comments || 0) + (stats?.likes || 0),
      meta: 'Total interactions this week' // Combines posts, likes, and comments into one engagement metric
    }
  ]

  return (
    <div className="min-h-screen bg-secondary text-[#0d1f14]">
      <Navbar
        menuOpen={menuOpen}
        toggleMenu={() => setMenuOpen((v) => !v)}
        closeMenu={() => setMenuOpen(false)}
        navSolid={true}
      />

      <main className="pt-24 pb-16">
        {loading ? (
          <div className="mx-auto w-full max-w-6xl px-4">
            <div className="mb-8 flex items-center gap-4">
              <div className="h-36 w-36 rounded-full bg-zinc-200 animate-pulse"></div>
              <div className="space-y-3">
                <div className="h-10 w-64 bg-zinc-200 rounded-xl animate-pulse"></div>
                <div className="h-6 w-40 bg-zinc-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-10">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white rounded-3xl animate-pulse border border-surface-border"></div>)}
            </div>
            <div className="space-y-6">
              <FeedItemSkeleton />
              <FeedItemSkeleton />
            </div>
          </div>
        ) : error ? (
          <div className="p-10 text-center">
            <p className="text-red-500 font-bold">{error}</p>
          </div>
        ) : !community ? (
          <div className="p-10 text-center text-surface-muted">No community found.</div>
        ) : (
          <div className="mx-auto w-full max-w-6xl px-4">
            <header className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {community?.community_logo ? (
                  <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white border border-surface-border shadow-sm">
                    <img
                      src={community.community_logo}
                      alt={community.community_name}
                      className="h-28 w-28 rounded-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-36 w-36 items-center justify-center rounded-full bg-zinc-100 text-4xl font-bold text-zinc-400">
                    {(community?.community_name || 'CO').slice(0, 2).toUpperCase()}
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-extrabold tracking-tight text-surface-dark">{community?.community_name} Dashboard</h1>
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20">Current Term: Spring 2026</span>
                  </div>
                  <p className="mt-2 text-lg text-surface-body">Manage your community workspace</p>
                </div>
              </div>
              <Link to={`/community/${id}`} className="btn-secondary flex items-center gap-2">
                View Public Page <ExternalLink size={16} />
              </Link>
            </header>



            {/* Metric Row */}
            <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              {statCards.map((stat) => (
                <div key={stat.label} className="card-border">
                  <p className="text-3xl font-bold text-surface-dark mb-1">{stat.value}</p>
                  <p className="text-body font-medium">{stat.label}</p>
                  <p className="mt-3 text-metadata font-semibold text-primary">
                    {stat.meta}
                  </p>
                </div>
              ))}
            </div>

            {/* Analytics Section: Community Health - 60/40 Split */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-10">

              {/* Community Interaction Leaderboard (60%) */}
              <div className="lg:col-span-3 card-border">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <h3 className="text-title">Community Leaderboard</h3>
                    <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Trending</span>
                  </div>
                  <span className="text-metadata px-2 py-1 bg-secondary rounded-md border border-surface-border">
                    Last 30 Days
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center text-center text-surface-muted bg-secondary/50 rounded-xl border border-dashed border-surface-border p-8 h-64">
                  <TrendingUp className="text-primary mb-2" size={32} />
                  <p className="font-semibold text-surface-dark">Interaction Overlap</p>
                  <p className="text-xs max-w-[280px] mt-1">
                    Engagement volume of AI Learners vs. other Herald societies.
                  </p>
                </div>
              </div>

              {/* Login Frequency (40%) */}
              <div className="lg:col-span-2 card-border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-title">Member Login Frequency</h3>
                  <Users size={16} className="text-surface-muted" />
                </div>

                {/* Placeholder for Donut Chart */}
                <div className="flex flex-col items-center justify-center text-center text-surface-muted bg-secondary/50 rounded-xl border border-dashed border-surface-border p-8 h-64">
                  <PieChart className="text-surface-dark mb-2" size={32} />
                  <p className="font-semibold text-surface-dark">Retention Mix</p>
                  <div className="flex flex-col gap-1 mt-2">
                    <p className="text-xs text-primary font-medium">● 65% Daily Hubbers</p>
                    <p className="text-xs text-surface-muted">● 25% Weekly Visitors</p>
                    <p className="text-xs text-surface-muted/60">● 10% Rare</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action & Feed Section */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Left Column - Action & Schedule */}
              <div className="lg:col-span-3 space-y-8">
                {/* Upcoming Schedule (Moved here to fill space appropriately) */}
                <div>
                  <h3 className="text-title mb-4">Upcoming Schedule</h3>
                  <div className="space-y-4">
                    {dashboardEvents.slice(0, 3).map(event => (
                      <div key={event.id} className="card-border flex flex-col sm:flex-row sm:items-center justify-between !p-4 gap-4">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/10 text-primary rounded-xl p-3 text-center min-w-[60px]">
                            <p className="text-xs font-bold uppercase">{event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short' }) : 'TBD'}</p>
                            <p className="text-lg font-black leading-none">{event.date ? new Date(event.date).getDate() : '--'}</p>
                          </div>
                          <div>
                            <h4 className="font-bold text-surface-dark line-clamp-1">{event.title}</h4>
                            <p className="text-metadata text-surface-muted flex items-center gap-1 mt-1">
                              <Calendar size={12} /> {event.start_time || 'TBD'} • {event.location || 'Online'}
                            </p>
                          </div>
                        </div>
                        <Link to={`/community/${id}/manage/events`} className="btn-secondary !px-4 !py-1.5 !text-xs whitespace-nowrap text-center">
                          Manage
                        </Link>
                      </div>
                    ))}
                    {dashboardEvents.length === 0 && (
                      <div className="card-border text-center text-surface-muted !py-8">No upcoming events scheduled.</div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-title mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {quickActions.map((action) => (
                      <Link
                        key={action.label}
                        to={action.path}
                        className="card-border flex flex-col items-center justify-center text-center gap-3 hover:border-primary hover:bg-primary/5 group !p-5"
                      >
                        <div className="bg-secondary rounded-full p-3 group-hover:bg-primary group-hover:text-white transition-colors text-surface-body">
                          {action.icon}
                        </div>
                        <span className="text-sm font-semibold text-surface-dark">{action.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Recent Activity */}
              <div className="lg:col-span-2">
                <h3 className="text-title mb-4">Recent Activity</h3>
                <div className="card-border !p-6">
                  <div className="space-y-6">
                    {combinedActivity.length > 0 ? combinedActivity.map((activity) => (
                      <div key={activity.id} className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-primary">
                        <p className="text-body font-medium flex items-center justify-between">
                          <span className="line-clamp-1 pr-2">{activity.content}</span>
                          {activity.type === 'announcement' && (
                            <span className="flex items-center gap-1 text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                              <Eye size={12} /> {Math.floor(Math.random() * 50) + 100} views
                            </span>
                          )}
                        </p>
                        <p className="text-metadata mt-1">{activity.time}</p>
                      </div>
                    )) : (
                      <p className="text-body">No recent activity.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
