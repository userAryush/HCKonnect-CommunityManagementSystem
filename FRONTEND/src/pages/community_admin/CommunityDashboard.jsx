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
  BarChart3,
  Activity,
  AlertCircle,
  Loader2,
  MessageSquare,
  Edit3,
  User,
  Settings
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import analyticsService from '../../services/analyticsService'


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
  const [analytics, setAnalytics] = useState(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [analyticsError, setAnalyticsError] = useState(null)

  const quickActions = [
    {
      label: 'Post Notice',
      path: `/community/${id}/manage/announcements/create`,
      icon: <Bell size={20} />,
      colorIcon: 'text-blue-500',
      hoverClass: 'hover:border-blue-500 hover:bg-blue-50/50 group-hover:bg-blue-500'
    },
    {
      label: 'Schedule Event',
      path: `/community/${id}/manage/events/create`,
      icon: <Calendar size={20} />,
      colorIcon: 'text-emerald-500',
      hoverClass: 'hover:border-emerald-500 hover:bg-emerald-50/50 group-hover:bg-emerald-500'
    },
    {
      label: 'Manage Members',
      path: `/community/${id}/manage/members`,
      icon: <Users size={20} />,
      colorIcon: 'text-amber-500',
      hoverClass: 'hover:border-amber-500 hover:bg-amber-50/50 group-hover:bg-amber-500'
    },
    {
      label: 'Start Discussion',
      path: `/community/${id}?tab=Discussions`,
      icon: <MessageSquare size={20} />,
      colorIcon: 'text-purple-500',
      hoverClass: 'hover:border-purple-500 hover:bg-purple-50/50 group-hover:bg-purple-500'
    },
    {
      label: 'Edit Profile',
      path: `/profile/edit/${id}`,
      icon: <Settings size={20} />,
      colorIcon: 'text-rose-500',
      hoverClass: 'hover:border-rose-500 hover:bg-rose-50/50 group-hover:bg-rose-500'
    },
    {
      label: 'View Profile',
      path: `/community/${id}`,
      icon: <User size={20} />,
      colorIcon: 'text-indigo-500',
      hoverClass: 'hover:border-indigo-500 hover:bg-indigo-50/50 group-hover:bg-indigo-500'
    },
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
          newMembers: communityRes.data.new_members_this_month || 0,
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

    const fetchAnalyticsData = async () => {
      setAnalyticsLoading(true)
      setAnalyticsError(null)
      try {
        const data = await analyticsService.getCommunityAnalytics(id)
        if (mounted) setAnalytics(data)
      } catch (err) {
        if (mounted) setAnalyticsError('Failed to load analytics data.')
      } finally {
        if (mounted) setAnalyticsLoading(false)
      }
    }

    fetchCommunity()
    fetchAnalyticsData()
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
      meta: `+ ${stats?.newMembers || 0} new members this month`,
      icon: <Users className="text-blue-500" size={20} />
    },
    {
      label: 'Weekly Engagement',
      value: analytics?.posts_last_7_days?.[analytics.posts_last_7_days.length - 1]?.count || 0,
      meta: 'Last 7 days activity',
      icon: <TrendingUp className="text-emerald-500" size={20} />
    },
    {
      label: 'Upcoming Events',
      value: stats?.upcomingEvents || 0,
      meta: 'Scheduled this term',
      icon: <Calendar className="text-amber-500" size={20} />
    },
    {
      label: 'Community Engagements',
      value: analytics?.total_engagements || 0,
      meta: 'Combined activity this week',
      icon: <Activity className="text-rose-500" size={20} />
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
              {statCards.map((stat, idx) => (
                <div key={stat.label} className="card-border relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-70 group-hover:opacity-100 transition-opacity">
                    {stat.icon}
                  </div>
                  {analyticsLoading && idx % 2 === 1 ? (
                    <div className="space-y-2">
                      <div className="h-8 w-16 bg-zinc-200 animate-pulse rounded-lg"></div>
                      <div className="h-4 w-24 bg-zinc-100 animate-pulse rounded-md"></div>
                      <div className="h-3 w-32 bg-zinc-50 animate-pulse rounded-sm mt-4"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-3xl font-bold text-surface-dark mb-1">{stat.value}</p>
                      <p className="text-body font-medium">{stat.label}</p>
                      <p className="mt-3 text-metadata font-semibold text-primary">
                        {stat.meta}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-10">

              {/* Community Engagement Comparison */}
              <div className="lg:col-span-3 card-border !p-0 overflow-hidden min-h-[400px]">
                <div className="flex items-center justify-between p-6 border-b border-surface-border">
                  <div className="flex items-center gap-2">
                    <h3 className="text-title">Engagement Comparison</h3>
                    <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Historical</span>
                  </div>
                  <BarChart3 size={18} className="text-surface-muted" />
                </div>

                <div className="p-6 h-[320px]">
                  {analyticsLoading ? (
                    <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                      <Loader2 className="animate-spin text-primary" size={32} />
                      <p className="text-sm text-surface-muted">Analyzing engagement metrics...</p>
                    </div>
                  ) : analyticsError ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 space-y-2">
                      <AlertCircle className="text-red-400" size={32} />
                      <p className="text-sm font-medium text-surface-dark">{analyticsError}</p>
                      <button onClick={() => window.location.reload()} className="text-xs text-primary font-bold hover:underline">Retry Loading</button>
                    </div>
                  ) : Object.values(analytics?.engagement || {}).every(v => v === 0) ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                      <Activity size={48} className="mb-4 text-surface-muted" />
                      <p className="font-semibold text-surface-dark">No Engagement Data Yet</p>
                      <p className="text-xs max-w-[240px] mt-1">Start posting announcements or events to see your community stats grow.</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Notices', value: analytics.engagement.announcements },
                          { name: 'Events', value: analytics.engagement.events },
                          { name: 'Posts', value: analytics.engagement.posts },
                          { name: 'Threads', value: analytics.engagement.discussions },
                        ]}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fontWeight: 600, fill: '#666' }}
                        />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                          cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                        />
                        <Bar
                          dataKey="value"
                          radius={[6, 6, 0, 0]}
                          barSize={40}
                        >
                          {
                            [
                              { name: 'Notices', value: analytics.engagement.announcements },
                              { name: 'Events', value: analytics.engagement.events },
                              { name: 'Posts', value: analytics.engagement.posts },
                              { name: 'Threads', value: analytics.engagement.discussions },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4]} fillOpacity={0.8} />
                            ))
                          }
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Top 5 Active Members (40%) */}
              <div className="lg:col-span-2 card-border !p-0 overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-surface-border">
                  <h3 className="text-title">Top Active Members</h3>
                  <Users size={18} className="text-surface-muted" />
                </div>

                <div className="p-0">
                  {analyticsLoading ? (
                    <div className="p-6 space-y-4">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-zinc-200 animate-pulse"></div>
                          <div className="space-y-2 flex-1">
                            <div className="h-4 w-24 bg-zinc-200 rounded animate-pulse"></div>
                            <div className="h-3 w-16 bg-zinc-100 rounded animate-pulse"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : !analytics?.top_members || analytics.top_members.length === 0 ? (
                    <div className="w-full h-[320px] flex flex-col items-center justify-center text-center p-8 opacity-40">
                      <Users size={40} className="mb-4 text-surface-muted" />
                      <p className="font-semibold text-surface-dark">No Active Members</p>
                      <p className="text-xs mt-1">Community members will appear here once they start engaging.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-surface-border max-h-[320px] overflow-y-auto">
                      {analytics.top_members.map((member, idx) => (
                        <div key={member.id} className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="h-10 w-10 rounded-full bg-zinc-100 border border-surface-border flex items-center justify-center overflow-hidden">
                                {member.profile_image ? (
                                  <img src={member.profile_image} alt={member.username} className="h-full w-full object-cover" />
                                ) : (
                                  <span className="text-sm font-bold text-zinc-500">{member.username.slice(0, 2).toUpperCase()}</span>
                                )}
                              </div>
                              {idx < 3 && (
                                <div className={`absolute -top-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white border-2 border-white ${idx === 0 ? 'bg-amber-400' : idx === 1 ? 'bg-zinc-400' : 'bg-amber-600'}`}>
                                  {idx + 1}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-surface-dark">{member.username}</p>
                              <p className="text-xs font-semibold text-surface-muted capitalize">{member.role}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-primary">{member.activity_score}</p>
                            <p className="text-[10px] font-bold text-surface-muted uppercase tracking-wider">Posts</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Community Leaderboard (Global Comparison) */}
            <div className="card-border mb-10 overflow-hidden !p-0">
              <div className="flex items-center justify-between p-6 border-b border-surface-border">
                <div className="flex items-center gap-2">
                  <h3 className="text-title">Communities Engagement Leaderboard</h3>
                  <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Global Rankings</span>
                </div>
                <BarChart3 size={18} className="text-surface-muted" />
              </div>
              <div className="p-6 h-[260px]">
                {analyticsLoading ? (
                  <div className="w-full h-full flex flex-col justify-end gap-2">
                    <div className="flex items-end justify-between px-4 gap-4 h-full">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex-1 bg-zinc-100 animate-pulse rounded-t-lg" style={{ height: `${20 + Math.random() * 60}%` }}></div>
                      ))}
                    </div>
                    <div className="flex justify-between px-4 h-4 bg-zinc-50 rounded animate-pulse"></div>
                  </div>
                ) : !analytics?.comparison || analytics.comparison.length === 0 ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                    <Activity size={32} className="mb-2 text-surface-muted" />
                    <p className="font-semibold text-surface-dark">Ranking unavailable</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analytics?.comparison || []}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={120}
                        axisLine={false}
                        tickLine={false}
                        style={{ fontSize: '12px', fontWeight: '600' }}
                        tick={{ fill: '#0d1f14' }}
                      />
                      <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eee' }}
                      />
                      <Bar
                        dataKey="score"
                        radius={[0, 12, 12, 0]}
                        barSize={24}
                      >
                        {
                          analytics.comparison.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.isCurrent ? '#32CD32' : '#f1f5f9'}
                            />
                          ))
                        }
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
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
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {quickActions.map((action) => (
                      <Link
                        key={action.label}
                        to={action.path}
                        className={`card-border flex flex-col items-center justify-center text-center gap-3 group !p-5 transition-colors ${action.hoverClass.split(' ').slice(0, 2).join(' ')}`}
                      >
                        <div className={`bg-secondary rounded-full p-3 group-hover:text-white transition-colors ${action.colorIcon} ${action.hoverClass.split(' ')[2]}`}>
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
                          {/* {activity.type === 'announcement' && (
                            <span className="flex items-center gap-1 text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                              <Eye size={12} /> {Math.floor(Math.random() * 50) + 100} views
                            </span>
                          )} */}
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
