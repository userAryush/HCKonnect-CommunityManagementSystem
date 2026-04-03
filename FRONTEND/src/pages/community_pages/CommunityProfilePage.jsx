import { useState, useEffect } from 'react'
import Navbar from "../../components/Navbar";
import { useParams, useSearchParams } from 'react-router-dom'
import apiClient from '../../services/apiClient'
import eventService from '../../services/eventService'
import announcementService from '../../services/announcementService'
import discussionService from '../../services/discussionService'
import postService from '../../services/postService'; // Import post service
import { useAuth } from '../../context/AuthContext';

import CommunityHeader from '../../components/community_profile/CommunityHeader';
import TabNavigation from '../../components/community_profile/TabNavigation';
import OverviewTab from '../../components/community_profile/OverviewTab';
import ContentGrid from '../../components/community_profile/ContentGrid';
import MembersTab from '../../components/community_profile/MembersTab';

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
    members: [],
    posts: [], // Add posts to state
    resources: [] // Add resources to state
  })
  const [loadingTab, setLoadingTab] = useState(false)
  const [error, setError] = useState('')
  const tabs = ['Overview', 'Posts', 'Events', 'Discussions', 'Resources', 'Members'] // Add Posts tab

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
        } else if (activeTab === 'Posts') { // Add fetch logic for Posts
          const res = await postService.getPostsForCommunity(id);
          setTabData(prev => ({ ...prev, posts: res.results || [] }));
        } else if (activeTab === 'Resources') { // Add fetch logic for Resources
          const res = await apiClient.get(`/contents/resources/?community_id=${id}`);
          setTabData(prev => ({ ...prev, resources: res.data.results || [] }));
        } else if (activeTab === 'Members') {
          const res = await apiClient.get(`/communities/${id}/members/`);
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
      registered_count: e.registered_count || 0,
      max_participants: e.max_participants,
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

  const isProfileOwner = Boolean(
    currentUser && id && currentUser.role === 'community' && String(currentUser.id) === String(id)
  );

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
          <CommunityHeader
            communityData={communityData}
            isProfileOwner={isProfileOwner}
            currentUser={currentUser}
            membershipStatus={membershipStatus}
            handleJoinRequest={handleJoinRequest}
            isMessageModalOpen={isMessageModalOpen}
            setIsMessageModalOpen={setIsMessageModalOpen}
          />

          <div className="mt-2 flex gap-8 border-b border-gray-200">
            <TabNavigation tabs={tabs} activeTab={activeTab} handleTabChange={handleTabChange} />
          </div>

          {/* Main Content Area */}
          <div className="mt-6">
            {activeTab === 'Overview' && (
              <OverviewTab
                communityData={communityData}
                tabData={tabData}
                loadingTab={loadingTab}
                canManageContent={canManageContent}
                handleTabChange={handleTabChange}
              />
            )}

            {activeTab === 'Announcements' && (
              <ContentGrid tab="Announcements" data={tabData.announcements} loading={loadingTab} />
            )}

            {activeTab === 'Events' && (
              <ContentGrid tab="Events" data={tabData.events} loading={loadingTab} />
            )}

            {activeTab === 'Discussions' && (
              <ContentGrid tab="Discussions" data={tabData.discussions} loading={loadingTab} />
            )}

            {activeTab === 'Posts' && (
              <ContentGrid tab="Posts" data={tabData.posts} loading={loadingTab} />
            )}

            {activeTab === 'Members' && (
              <MembersTab members={tabData.members} loading={loadingTab} />
            )}

            {activeTab === 'Resources' && (
              <ContentGrid tab="Resources" data={tabData.resources} loading={loadingTab} />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
