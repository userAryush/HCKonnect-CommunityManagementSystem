import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/accounts/Landing'
import Register from './pages/accounts/Register'
import Login from './pages/accounts/Login'
import Feed from './pages/accounts/Feed'
import Profile from './pages/accounts/Profile'
import EditProfile from './pages/accounts/EditProfile'
import CommunityProfilePage from './pages/community_pages/CommunityProfilePage'
import CommunityDashboard from './pages/community_admin/CommunityDashboard'
import CreateAnnouncement from './pages/community_admin/CreateAnnouncement'
import MemberManagement from './pages/community_admin/MemberManagement'
import CommunitiesList from './pages/community_pages/CommunitiesList'
import CreateVacancy from './pages/community_admin/CreateVacancy'
import EventDetailPage from './pages/community_pages/EventDetailPage'
import EventRegistrationPage from './pages/community_pages/EventRegistrationPage';
import CreateEvent from './pages/community_admin/CreateEvent'

import EventsList from './pages/community_pages/EventsList'
import AnnouncementsList from './pages/community_pages/AnnouncementsList'
import DiscussionList from './pages/community_pages/DiscussionList'
import CreateDiscussion from './pages/community_pages/CreateDiscussion'
import DiscussionDetail from './pages/community_pages/DiscussionDetail'

import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
            <Route path="/feed" element={<Feed />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/events" element={<EventsList />} />
            <Route path="/events" element={<EventsList />} />
            <Route path="/announcements" element={<AnnouncementsList />} />
            <Route path="/discussions" element={<DiscussionList />} />
            <Route path="/discussions/create" element={<CreateDiscussion />} />
            <Route path="/discussions/:id" element={<DiscussionDetail />} />
            <Route path="/events/:eventId/register" element={<EventRegistrationPage />} />

            {/* Admin / Management Routes */}
            <Route path="/community/:id/dashboard" element={<CommunityDashboard />} />
            <Route path="/community/:id/manage/announcements/create" element={<CreateAnnouncement />} />
            <Route path="/community/:id/manage/members" element={<MemberManagement />} />
            <Route path="/community/:id/manage/vacancies/create" element={<CreateVacancy />} />
            <Route path="/community/:id/manage/events/create" element={<CreateEvent />} />
            <Route path="/community/:id/manage/events/:eventId/edit" element={<CreateEvent />} />
            <Route path="/community/:id/manage/events" element={<EventsList />} />
            <Route path="/community/:id/manage/announcements" element={<AnnouncementsList />} />
          </Route>

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

