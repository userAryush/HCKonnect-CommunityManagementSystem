import { useState, useEffect } from 'react'
import Navbar from "../../components/Navbar";
import EventCard from '../../components/cards/EventCard'
import AnnouncementCard from '../../components/cards/AnnouncementCard'
import DiscussionCard from '../../components/cards/DiscussionCard'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import apiClient from '../../services/apiClient'
import eventService from '../../services/eventService'
import announcementService from '../../services/announcementService'
import discussionService from '../../services/discussionService'
import ResourceList from './ResourceList';
import ResourceCard from '../../components/cards/ResourceCard'
import { Calendar, Users, Edit2, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SendMessageModal from '../../components/modals/SendMessageModal';

// Reusable Soft Container Component
const SoftContainer = ({ children, className = '' }) => (
  <div className={`bg-white border border-gray-200 rounded-xl p-5 ${className}`}>
    {children}
  </div>
);

export default function CommunityProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'Overview')
  const [menuOpen, setMenuOpen] = useState(false)
  const [membershipStatus, setMembershipStatus] = useState('none') // none, pending, joined
  const [communityData, setCommunityData] = useState(null)
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  const { user: currentUser } = useAuth()

  const [tabData, setTabData] = useState({
    events: [],
    announcements: [],
    discussions: [],
    members: []
  })
  const [loadingTab, setLoadingTab] = useState(false)
  const [error, setError] = useState('')
  const tabs = ['Overview', 'Events', 'Discussions', 'Resources', 'Members']

  const handleJoinRequest = () => {
    setMembershipStatus('pending')
  }

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const res = await apiClient.get(`/communities/dashboard/${id}/`)
        setCommunityData(res.data)
      } catch (err) {
        console.error("Failed to load community", err)
        setError('Failed to load community. You may not have access or need to login.')
      }
    }
    fetchCommunity()
  }, [id])

  // Fetching real data dynamically based on the active tab
  useEffect(() => {
    if (!id) return;
    const fetchTabContent = async () => {
      setLoadingTab(true);
      try {
        if (activeTab === 'Overview') {
          const [evs, anns] = await Promise.all([
            eventService.getEvents(id, 1),
            announcementService.getAnnouncements(1, id)
          ]);
          setTabData(prev => ({
            ...prev,
            events: mapEvents(evs.results || []),
            announcements: mapAnnouncements(anns.results || [])
          }));
        } else if (activeTab === 'Events') {
          const res = await eventService.getEvents(id, 1);
          setTabData(prev => ({ ...prev, events: mapEvents(res.results || []) }));
        } else if (activeTab === 'Announcements') {
          const res = await announcementService.getAnnouncements(1, id);
          setTabData(prev => ({ ...prev, announcements: mapAnnouncements(res.results || []) }));
        } else if (activeTab === 'Discussions') {
          const res = await discussionService.getDiscussions(1, id);
          setTabData(prev => ({ ...prev, discussions: res.results || [] }));
        } else if (activeTab === 'Members') {
          const res = await apiClient.get(`/communities/${id}/members/`);
          // Note: Backend might return array natively or paginated {results: ...}
          const membersArray = res.data.results ? res.data.results : res.data;
          setTabData(prev => ({ ...prev, members: membersArray || [] }));
        }
      } catch (err) {
        console.error(`Error loading data for ${activeTab}`, err);
      } finally {
        setLoadingTab(false);
      }
    };
    fetchTabContent();
  }, [activeTab, id]);

  const mapEvents = (eventsArr) => {
    return eventsArr.map(e => ({
      ...e,
      type: 'event',
      id: e.id,
      createdAt: e.created_at,
      eventMeta: { date: e.date, time: e.start_time, location: e.location },
      stats: { registrations: { current: 0, capacity: 100 } },
      community: { name: e.community_name || 'Community', logoText: (e.community_name || 'CO').substring(0, 2).toUpperCase() }
    }));
  };

  const mapAnnouncements = (annsArr) => {
    return annsArr.map(a => ({
      ...a,
      type: 'announcement',
      id: a.id,
      createdAt: a.created_at,
      community: { id: a.community, name: a.community_name || 'Community', logoText: (a.community_name || 'CO').substring(0, 2).toUpperCase() },
      author: { name: a.uploaded_by || 'Admin' }
    }));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  }

  if (!communityData) {
    return <div className="pt-24 text-center">Loading community…</div>
  }

  // Strict ownership check: Only the actual community account can edit the profile itself
  const isProfileOwner = Boolean(
    currentUser && id && currentUser.role === 'community' && String(currentUser.id) === String(id)
  );

  // Content management check: Both the community owner and its representatives can manage content
  const canManageContent = Boolean(
    isProfileOwner ||
    (currentUser && id && currentUser.membership && currentUser.membership.role === 'representative' &&
      String(currentUser.membership.community_id || currentUser.membership.community) === String(id))
  );

  if (error) {
    return <div className="pt-32 text-center text-red-500">{error}</div>
  }

  return (
    <div className="min-h-screen bg-secondary text-surface-dark">
      <Navbar
        menuOpen={menuOpen}
        toggleMenu={() => setMenuOpen((v) => !v)}
        closeMenu={() => setMenuOpen(false)}
        navSolid={true}
      />

      <main className="pt-24 pb-16">
        <div className="mx-auto w-full max-w-6xl px-4 xl:px-0">
          {/* Header Section */}
          <header className="rounded-xl border border-gray-200 bg-white pt-8 px-8 overflow-hidden mb-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Logo */}
                {communityData.community_logo ? (
                  <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white overflow-hidden">
                    <img
                      src={communityData.community_logo}
                      alt={communityData.community_name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-surface-dark text-white text-2xl font-bold">
                    {communityData.community_name.slice(0, 2).toUpperCase()}
                  </div>
                )}

                {/* Info */}
                <div className="text-center sm:text-left mt-1">
                  <h1 className="text-2xl font-bold text-surface-dark">
                    {communityData.community_name}
                  </h1>
                  <div className="mt-3 flex items-center justify-center sm:justify-start gap-3">
                    <span className="text-xs font-medium text-surface-muted">
                      {Number(communityData.member_count || 0).toLocaleString()} members
                    </span>
                    {!communityData.vacanciesOpen && (
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-surface-muted border border-gray-200 ml-2">
                        Applications Closed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap justify-center sm:justify-end gap-3">
                {(isProfileOwner === true) && (
                  <Link
                    to={`/profile/edit/${id}`}
                    className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-bold text-surface-dark transition hover:bg-zinc-50 hover:border-zinc-300"
                  >
                    <Edit2 size={16} className="text-primary" />
                    <span>Edit Profile</span>
                  </Link>
                )}

                {/* Send Message Button */}
                {(isProfileOwner === false) && currentUser && (
                  <button
                    onClick={() => setIsMessageModalOpen(true)}
                    className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary/10"
                  >
                    <Mail size={16} />
                    <span>Send Email to {communityData.community_name}</span>
                  </button>
                )}

                {communityData.vacanciesOpen && (
                  <button
                    onClick={handleJoinRequest}
                    disabled={membershipStatus === 'pending'}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${membershipStatus === 'pending'
                      ? 'bg-gray-50 border border-gray-200 text-surface-muted cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-primary/90'
                      }`}
                  >
                    {membershipStatus === 'pending' ? 'Request Sent' : 'Request to Join'}
                  </button>
                )}
              </div>
            </div>

            {/* Send Message Modal Integration */}
            <SendMessageModal
              isOpen={isMessageModalOpen}
              onClose={() => setIsMessageModalOpen(false)}
              communityName={communityData.community_name}
              communityEmail={communityData.email}
              senderEmail={currentUser?.email}
              communityId={id}
            />

            {/* Tabs */}
            <div className="mt-8 flex gap-8 border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`-mb-px border-b-2 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-surface-muted hover:text-surface-dark'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </header>

          {/* Main Content Area */}
          <div>
            {activeTab === 'Overview' && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* LEFT: Primary Content (70%) */}
                <div className="lg:col-span-2 space-y-6">
                  {/* About Section */}
                  <SoftContainer>
                    <h2 className="text-lg font-semibold text-surface-dark mb-3">About</h2>
                    <p className="text-sm leading-relaxed text-surface-muted whitespace-pre-line">
                      {communityData.community_description}
                    </p>
                  </SoftContainer>

                  {/* Upcoming Schedule Section */}
                  <SoftContainer>
                    <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-3">
                      <h2 className="text-lg font-semibold text-surface-dark">Upcoming Schedule</h2>
                    </div>

                    <div className="space-y-4">
                      {loadingTab ? (
                        <div className="py-10 text-center text-sm text-surface-muted">Loading schedule...</div>
                      ) : tabData.events.length === 0 ? (
                        <div className="card-border text-center text-surface-muted !py-8">No upcoming events scheduled.</div>
                      ) : (
                        <div className="space-y-4">
                          {tabData.events.slice(0, 3).map(event => (
                            <div key={event.id} className="card-border flex flex-col sm:flex-row sm:items-center justify-between !p-4 gap-4 transition-all hover:bg-zinc-50/50">
                              <div className="flex items-center gap-4">
                                <div className="bg-primary/10 text-primary rounded-xl p-3 text-center min-w-[60px]">
                                  <p className="text-xs font-bold uppercase">{event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short' }) : 'TBD'}</p>
                                  <p className="text-lg font-black leading-none">{event.date ? new Date(event.date).getDate() : '--'}</p>
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-bold text-sm text-surface-dark line-clamp-1">{event.title}</h4>
                                  <p className="text-[10px] text-surface-muted flex items-center gap-1 mt-1 font-medium">
                                    <Calendar size={12} /> {event.start_time || 'TBD'} • {event.location || 'Online'}
                                  </p>
                                </div>
                              </div>
                              {(canManageContent === true) && (
                                <Link to={`/events/${event.id}`} className="btn-secondary !px-4 !py-1.5 !text-[11px] font-bold whitespace-nowrap text-center transition-all">
                                  Manage
                                </Link>
                              )}
                            </div>
                          ))}

                          {tabData.events.length > 3 && (
                            <button
                              onClick={() => handleTabChange('Events')}
                              className="text-xs font-bold text-primary hover:text-primary/80 transition-colors inline-block w-full text-center mt-2"
                            >
                              View all events
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </SoftContainer>
                </div>

                {/* RIGHT: Sidebar (30%) */}
                <aside className="space-y-6 sticky top-28">
                  {/* Recent Announcements */}
                  <SoftContainer>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-muted mb-4">
                      Recent Announcements
                    </h3>
                    <div className="flex flex-col space-y-4">
                      {loadingTab ? (
                        <div className="text-center text-sm text-surface-muted py-2">Loading...</div>
                      ) : tabData.announcements.length === 0 ? (
                        <div className="py-4 text-sm text-surface-body text-center">No announcements yet.</div>
                      ) : (
                        <>
                          {tabData.announcements.slice(0, 3).map((ann, index) => (
                            <div
                              key={ann.id}
                              className="group cursor-pointer pb-3 border-b border-gray-100 last:border-0"
                              onClick={() => handleTabChange('Announcements')}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] text-surface-muted">
                                  {new Date(ann.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <h4 className="text-sm font-semibold text-surface-dark group-hover:text-primary transition-colors line-clamp-1">
                                {ann.title}
                              </h4>
                              <p className="text-xs text-surface-muted line-clamp-2 mt-1">
                                {ann.content}
                              </p>
                            </div>
                          ))}

                          {tabData.announcements.length > 3 && (
                            <button
                              onClick={() => handleTabChange('Announcements')}
                              className="text-xs font-bold text-primary hover:text-primary/80 transition-colors inline-block w-full text-center mt-2"
                            >
                              View all announcements
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </SoftContainer>

                  {/* Quick Actions */}
                  <SoftContainer>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-muted mb-4">
                      Quick Actions
                    </h3>
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => handleTabChange('Members')}
                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-left text-sm font-semibold text-surface-dark transition-colors hover:bg-gray-50 flex items-center gap-2"
                      >
                        <span className="text-base">👥</span> View Members
                      </button>
                      <button
                        onClick={() => handleTabChange('Announcements')}
                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-left text-sm font-semibold text-surface-dark transition-colors hover:bg-gray-50 flex items-center gap-2"
                      >
                        <span className="text-base">📢</span> View Announcements
                      </button>
                    </div>
                  </SoftContainer>
                </aside>
              </div>
            )}

            {activeTab === 'Announcements' && (
              <SoftContainer className="!p-6">
                {loadingTab ? <p className="text-center text-surface-muted py-10">Loading announcements...</p> : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tabData.announcements.map((ann) => (
                      <AnnouncementCard key={ann.id} item={ann} />
                    ))}
                    {tabData.announcements.length === 0 && (
                      <div className="col-span-full py-10 text-center text-surface-muted">No announcements found.</div>
                    )}
                  </div>
                )}
              </SoftContainer>
            )}

            {activeTab === 'Events' && (
              <SoftContainer className="!p-6">
                {loadingTab ? <p className="text-center text-surface-muted py-10">Loading events...</p> : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tabData.events.map((event) => (
                      <EventCard key={event.id} item={event} />
                    ))}
                    {tabData.events.length === 0 && (
                      <div className="col-span-full py-10 text-center text-surface-muted">No events found.</div>
                    )}
                  </div>
                )}
              </SoftContainer>
            )}

            {activeTab === 'Discussions' && (
              <SoftContainer className="!p-6">
                {loadingTab ? <p className="text-center text-surface-muted py-10">Loading discussions...</p> : (
                  <div className="space-y-4">
                    {tabData.discussions.length > 0 ? tabData.discussions.map((disc) => (
                      <DiscussionCard key={disc.id} item={disc} />
                    )) : (
                      <div className="py-10 text-center text-surface-muted">No discussions yet.</div>
                    )}
                  </div>
                )}
              </SoftContainer>
            )}

            {activeTab === 'Members' && (
              <SoftContainer className="!p-0 overflow-hidden">
                <div className="p-5 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-surface-dark flex items-center gap-2">
                    <Users size={20} className="text-primary" />
                    Community Members
                  </h2>
                  <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">{tabData.members.length} Total</span>
                </div>

                {loadingTab ? <p className="text-center text-surface-muted py-10">Loading members...</p> : (
                  <ul className="divide-y divide-gray-100 flex flex-col">
                    {tabData.members.map((member) => (
                      <li key={member.membership_id} className="hover:bg-gray-50 transition-colors">
                        <Link to={`/profile/${member.user_id}`} className="flex items-center gap-4 px-6 py-4">
                          {member.profile_image ? (
                            <img src={member.profile_image} alt={member.first_name} className="w-12 h-12 rounded-full border border-gray-200 object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-surface-dark text-white flex items-center justify-center font-bold text-sm">
                              {member.first_name ? member.first_name[0].toUpperCase() : member.username[0].toUpperCase()}
                              {member.last_name ? member.last_name[0].toUpperCase() : ''}
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-surface-dark">
                              {member.first_name ? `${member.first_name} ${member.last_name}` : member.username}
                            </h4>
                            <p className="text-xs text-surface-muted">@{member.username}</p>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${member.role === 'representative' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-gray-100 text-surface-muted border-gray-200'}`}>
                              {member.role}
                            </span>
                          </div>
                        </Link>
                      </li>
                    ))}
                    {tabData.members.length === 0 && (
                      <div className="py-12 text-center text-surface-muted">No members found.</div>
                    )}
                  </ul>
                )}
              </SoftContainer>
            )}

            {activeTab === 'Resources' && (
              <ResourceList
                communityId={id}
                initialUploadOpen={searchParams.get('action') === 'upload'}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
