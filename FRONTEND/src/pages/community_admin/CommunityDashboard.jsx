import { useState, useEffect } from 'react'
import axios from 'axios'  // <-- add this
import { Link, useParams } from 'react-router-dom'
import Navbar from '../../components/Navbar'



export default function CommunityDashboard() {

  const { id } = useParams()
  const [menuOpen, setMenuOpen] = useState(false)
  const [community, setCommunity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')





  const stats = community ? [
    { label: 'Total Members', value: community.member_count.toLocaleString(), change: '+12% this week', trend: 'up' },
    { label: 'Announcements', value: '12', change: '+2 this week', trend: 'up' },
    { label: 'Active Discussions', value: '8', change: '-1 this week', trend: 'down' },
    { label: 'Upcoming Events', value: '3', change: 'Same as last week', trend: 'neutral' },
  ] : []


  const quickActions = [
    { label: 'Create Announcement', path: `/community/${id}/manage/announcements/create`, icon: '📢' },
    { label: 'Create Event', path: `/community/${id}/manage/events/create`, icon: '📅' },
    { label: 'Start Discussion', path: `/community/${id}/manage/discussions/create`, icon: '💬' },
    { label: 'Upload Resource', path: `/community/${id}/manage/resources/upload`, icon: '📂' },
    { label: 'Manage Members', path: `/community/${id}/manage/members`, icon: '👥' },
    { label: 'Moderate Discussions', path: `/community/${id}/manage/moderation`, icon: '🛡️' },
  ]

  const recentActivity = [
    { id: 1, type: 'registration', content: 'New member registration: Alice Johnson', time: '10 min ago' },
    { id: 2, type: 'post', content: 'New post by Mike Ross: "Project help needed"', time: '45 min ago' },
    { id: 3, type: 'discussion', content: 'New discussion started: "React vs Vue?"', time: '2 hours ago' },
    { id: 4, type: 'event', content: 'Event "Intro to React" updated', time: '5 hours ago' },
  ]

  // Mock Data for Charts
  const memberGrowthData = [450, 480, 520, 590, 650, 720]
  const eventParticipationData = [
    { name: 'Hackathon', value: 85 },
    { name: 'Workshop', value: 60 },
    { name: 'Meetup', value: 45 },
    { name: 'Seminar', value: 90 },
    { name: 'Social', value: 30 },
  ]

  const maxMemberCount = Math.max(...memberGrowthData)
  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')

    const fetchCommunity = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/communities/dashboard/${id}/`)
        if (!mounted) return
        setCommunity(response.data)
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

  if (loading) return <div className="p-10 text-center">Loading community dashboard...</div>
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>
  if (!community) return null


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
              {community.community_logo ? (
                <div className="flex h-34 w-34 items-center justify-center rounded-full bg-white border-4 border-[#75C043] shadow-lg">
                  <img
                    src={community.community_logo}
                    alt={community.community_name}
                    className="h-30 w-30 rounded-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-36 w-36 items-center justify-center rounded-full bg-[#f4f5f2] text-4xl font-bold">
                  {community.community_name.slice(0, 2).toUpperCase()}
                </div>
              )}






              <div>
                <h1 className="text-4xl font-extrabold">{community.community_name} Dashboard</h1>
                <p className="mt-2 text-lg text-[#4b4b4b]">Manage your community</p>
              </div>

            </div>
            <Link to="/community" className="text-sm font-semibold text-[#75C043] hover:underline">
              View Public Page
            </Link>
          </header>

          {/* Stats Grid */}
          <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
                <p className="text-3xl font-bold text-[#0d1f14]">{stat.value}</p>
                <p className="text-sm font-medium text-[#4b4b4b]">{stat.label}</p>
                <p className={`mt-2 text-xs font-semibold ${stat.trend === 'up' ? 'text-green-600' :
                  stat.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                  }`}>
                  {stat.change}
                </p>
              </div>
            ))}
          </div>

          {/* Analytics Section */}
          <div className="mb-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Member Growth Chart */}
            <div className="rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
              <h3 className="mb-6 text-lg font-bold">Member Growth (Last 6 Months)</h3>
              <div className="flex h-48 items-end justify-between gap-2">
                {memberGrowthData.map((value, idx) => (
                  <div key={idx} className="flex w-full flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-lg bg-[#75C043] transition-all hover:opacity-80"
                      style={{ height: `${(value / maxMemberCount) * 100}%` }}
                    ></div>
                    <span className="text-xs text-[#4b4b4b]">M{idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Participation Chart */}
            <div className="rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
              <h3 className="mb-6 text-lg font-bold">Event Participation</h3>
              <div className="space-y-4">
                {eventParticipationData.map((item, idx) => (
                  <div key={idx}>
                    <div className="mb-1 flex justify-between text-xs font-semibold">
                      <span>{item.name}</span>
                      <span>{item.value}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#f4f5f2]">
                      <div
                        className="h-full rounded-full bg-[#0d1f14]"
                        style={{ width: `${item.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
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
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-[#75C043]">
                      <p className="text-sm font-medium text-[#0d1f14]">{activity.content}</p>
                      <p className="text-xs text-[#4b4b4b] mt-1">{activity.time}</p>
                    </div>
                  ))}
                </div>
                <button className="mt-6 w-full rounded-xl border border-[#e5e7eb] py-3 text-sm font-bold transition hover:bg-[#f4f5f2]">
                  View All Activity
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}
