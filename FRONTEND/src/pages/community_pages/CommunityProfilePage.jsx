import { useState, useEffect } from 'react'
import Navbar from "../../components/Navbar";
import EventCard from '../../components/cards/EventCard'
import { useParams } from 'react-router-dom'
import apiClient from '../../services/apiClient'

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('Overview')
  const [menuOpen, setMenuOpen] = useState(false)
  const [membershipStatus, setMembershipStatus] = useState('none') // none, pending, joined
  const { id } = useParams()
  const [communityData, setCommunityData] = useState(null)
  const [error, setError] = useState('')
  const tabs = ['Overview', 'Events', 'Discussions', 'Resources', 'Members']

  const handleJoinRequest = () => {

    setMembershipStatus('pending')

  }
  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        // Use apiClient to ensure auth tokens are attached
        const res = await apiClient.get(`/communities/dashboard/${id}/`)
        setCommunityData(res.data)
      } catch (err) {
        console.error("Failed to load community", err)
        setError('Failed to load community. You may not have access or need to login.')

      }
    }
    fetchCommunity()
  }, [id])

  if (!communityData) {
    return <div className="pt-24 text-center">Loading community…</div>
  }


  if (error) {
    return <div className="pt-32 text-center text-red-500">{error}</div>
  }


  // Use real data from backend, falling back to empty arrays
  const communityEvents = communityData.events || []
  const communityAnnouncements = communityData.announcements || []

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
          {/* Header */}
          <header className="mb-8 rounded-[2.5rem] bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-6">
                {communityData.community_logo ? (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white border-4 border-[#75C043] shadow-lg">
                    <img
                      src={communityData.community_logo}
                      alt={communityData.community_name}
                      className="h-24 w-24 rounded-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#f4f5f2] text-4xl font-bold">
                    {communityData.community_name.slice(0, 2).toUpperCase()}
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold">
                      {communityData.community_name}
                    </h1>

                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm text-[#4b4b4b]">
                    <span>{Number(communityData.member_count || 0).toLocaleString()} members</span>


                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={handleJoinRequest}
                  disabled={!communityData.vacanciesOpen || membershipStatus === 'pending'}
                  className={`rounded-full px-6 py-3 text-sm font-semibold transition ${!communityData.vacanciesOpen
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : membershipStatus === 'pending'
                      ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                      : 'bg-[#0d1f14] text-white hover:bg-[#0d1f14]/90'
                    }`}
                >
                  {!communityData.vacanciesOpen
                    ? 'Applications currently closed'
                    : membershipStatus === 'pending'
                      ? 'Request Sent'
                      : 'Request to Join'}
                </button>

              </div>
            </div>

            <div className="mt-8 flex gap-8 border-b border-[#f4f5f2] text-sm font-semibold text-[#4b4b4b] overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`border-b-2 pb-3 transition ${activeTab === tab
                    ? 'border-[#75C043] text-[#0d1f14]'
                    : 'border-transparent hover:text-[#0d1f14]'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </header>

          {/* Tab Content */}
          {activeTab === 'Overview' && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <section className="rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-lg font-bold">
                    About {communityData.community_name}
                  </h2>

                  <p className="text-sm leading-relaxed text-[#4b4b4b]">
                    {communityData.community_description}
                  </p>

                </section>

                {/* Announcements Section */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">Recent Announcements</h2>
                    <button onClick={() => setActiveTab('Announcements')} className="text-sm font-semibold text-[#75C043] hover:underline">
                      View More
                    </button>
                  </div>
                  <div className="flex flex-col gap-4">
                    {/* Mock Announcements - In real app, filter by community */}
                    <div className="rounded-3xl border border-[#e5e7eb] bg-[#fffcf5] p-5 shadow-sm">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-full bg-[#FFF8DE] px-2 py-1 text-[10px] font-bold text-[#c08619]">ANNOUNCEMENT</span>
                        <span className="text-xs text-[#4b4b4b]">2 days ago</span>
                      </div>
                      <h3 className="text-base font-bold text-[#0d1f14]">Welcome to the new semester!</h3>
                      <p className="mt-1 text-sm text-[#4b4b4b] line-clamp-2">We have exciting events planned for this term. Stay tuned for updates on our first general meeting.</p>
                    </div>
                    <div className="rounded-3xl border border-[#e5e7eb] bg-[#fffcf5] p-5 shadow-sm">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-full bg-[#FFF8DE] px-2 py-1 text-[10px] font-bold text-[#c08619]">ANNOUNCEMENT</span>
                        <span className="text-xs text-[#4b4b4b]">5 days ago</span>
                      </div>
                      <h3 className="text-base font-bold text-[#0d1f14]">Call for Volunteers</h3>
                      <p className="mt-1 text-sm text-[#4b4b4b] line-clamp-2">We are looking for enthusiastic members to help organize our upcoming hackathon.</p>
                    </div>
                  </div>
                </section>
              </div>

              <aside className="space-y-6">
                <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-lg font-bold">Upcoming Events</h3>
                  <div className="flex flex-col gap-4">
                    {communityEvents.slice(0, 2).map((item) => <EventCard key={item.id} item={item} compact={true} />)}
                    {communityEvents.length === 0 && <p className="text-sm text-[#4b4b4b]">No upcoming events.</p>}
                    {communityEvents.length > 2 && (
                      <button onClick={() => setActiveTab('Events')} className="text-xs font-semibold text-[#75C043] hover:underline">View More</button>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-lg font-bold">Quick Actions</h3>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setActiveTab('Members')}
                      className="w-full rounded-xl bg-[#f4f5f2] px-4 py-3 text-left text-sm font-semibold text-[#0d1f14] transition hover:bg-[#e5e7eb]"
                    >
                      👥 View Members
                    </button>
                    <button
                      onClick={() => setActiveTab('Announcements')}
                      className="w-full rounded-xl bg-[#f4f5f2] px-4 py-3 text-left text-sm font-semibold text-[#0d1f14] transition hover:bg-[#e5e7eb]"
                    >
                      📢 View Announcements
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          )}

          {activeTab !== 'Overview' && (
            <div className="rounded-3xl border border-[#e5e7eb] bg-white p-10 text-center">
              <p className="text-[#4b4b4b]">Content for {activeTab} tab goes here.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
