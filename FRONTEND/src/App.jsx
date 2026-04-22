import './App.css'
import { Routes, Route } from 'react-router-dom'
import Landing from './features/landing/page/Landing'
import Register from './features/authentication/pages/Register'
import Login from './features/authentication/pages/Login'
import Feed from './features/feed/pages/Feed'
import Profile from './features/profile/pages/Profile'
import EditProfile from './features/profile/pages/EditProfile'
import CommunityProfilePage from './features/profile/pages/CommunityProfilePage'
import CommunityDashboard from './features/community_dash/pages/CommunityDashboard'
import CreateAnnouncement from './features/announcement/pages/CreateAnnouncement'
import MemberManagement from './features/member_management/pages/MemberManagement'
import CommunitiesList from './features/community_dash/pages/CommunitiesList'
import CreateVacancy from './features/vacancy/pages/CreateVacancy';
import VacancyPage from './features/vacancy/pages/VacancyPage';
import VacancyApplicantsPage from './features/vacancy/pages/VacancyApplicantsPage';
import EventDetailPage from './features/events/pages/EventDetailPage'
import EventRegistrationPage from './features/events/pages/EventRegistrationPage';
import CreateEvent from './features/events/pages/CreateEvent'

import EventsList from './features/events/pages/EventsList'
import AnnouncementsList from './features/announcement/pages/AnnouncementsList'
import DiscussionList from './features/discussion/pages/DiscussionList'
import CreateDiscussion from './features/discussion/pages/CreateDiscussion'
import DiscussionDetail from './features/discussion/pages/DiscussionDetail'
import PostList from './features/posts/pages/PostList'
import PostDetail from './features/posts/pages/PostDetail'
import FirstLoginChangePassword from './features/authentication/pages/FirstLoginChangePassword'
import EventParticipantsPage from './features/events/pages/EventParticipantsPage'

import ProtectedRoute from './shared/components/layout/ProtectedRoute'

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/communities" element={<CommunitiesList />} />
      <Route path="/events/:eventId" element={<EventDetailPage />} />
      <Route path="/community" element={<CommunityProfilePage />} />
      <Route path="/community/:id" element={<CommunityProfilePage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/change-password" element={<FirstLoginChangePassword />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/profile/edit/:id" element={<EditProfile />} />
        <Route path="/events" element={<EventsList />} />
        <Route path="/announcements" element={<AnnouncementsList />} />
        <Route path="/discussions" element={<DiscussionList />} />
        <Route path="/discussions/create" element={<CreateDiscussion />} />
        <Route path="/discussions/:id" element={<DiscussionDetail />} />
        <Route path="/posts" element={<PostList />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/events/:eventId/register" element={<EventRegistrationPage />} />

        {/* Admin / Management Routes */}
        <Route path="/community/:id/dashboard" element={<CommunityDashboard />} />
        <Route path="/community/:id/manage/announcements/create" element={<CreateAnnouncement />} />
        <Route path="/community/:id/manage/members" element={<MemberManagement />} />
        <Route path="/community/:id/manage/vacancies/create" element={<CreateVacancy />} />
        <Route path="/community/:id/manage/vacancies/list" element={<VacancyPage />} />
        <Route path="/community/:id/vacancies/:vacancyId/applicants" element={<VacancyApplicantsPage />} />
        <Route path="/community/:id/manage/events/create" element={<CreateEvent />} />
        <Route path="/community/:id/manage/events/:eventId/edit" element={<CreateEvent />} />
        <Route path="/community/:id/manage/events/:eventId/participants" element={<EventParticipantsPage />} />
        <Route path="/community/:id/manage/events" element={<EventsList />} />
        <Route path="/community/:id/manage/announcements" element={<AnnouncementsList />} />
      </Route>

    </Routes>
  )
}

export default App

