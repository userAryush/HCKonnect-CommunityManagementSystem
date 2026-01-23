import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/accounts/Landing'
import Register from './pages/accounts/Register'
import Login from './pages/accounts/Login'
import Feed from './pages/accounts/Feed'
import CommunityProfilePage from './pages/community_pages/CommunityProfilePage'
import CommunityDashboard from './pages/community_admin/CommunityDashboard'
import CreateAnnouncement from './pages/community_admin/CreateAnnouncement'
import MemberManagement from './pages/community_admin/MemberManagement'
import CommunitiesList from './pages/community_pages/CommunitiesList'
import CreateVacancy from './pages/community_admin/CreateVacancy'
import EventDetailPage from './pages/community_pages/EventDetailPage'
import EventRegistrationPage from './pages/community_pages/EventRegistrationPage';
import CreateEvent from './pages/community_admin/CreateEvent'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/communities" element={<CommunitiesList />} />

        <Route path="/events/:eventId/register" element={<EventRegistrationPage />} />
        <Route path="/events/:eventId" element={<EventDetailPage />} />

        {/* Community Pages */}
        <Route path="/community" element={<CommunityProfilePage />} />
        <Route path="/community/:id" element={<CommunityProfilePage />} />

        {/* Admin / Management Routes */}
        <Route path="/community/:id/dashboard" element={<CommunityDashboard />} />
        <Route path="/community/:id/manage/announcements/create" element={<CreateAnnouncement />} />
        <Route path="/community/:id/manage/members" element={<MemberManagement />} />
        <Route path="/community/:id/manage/vacancies/create" element={<CreateVacancy />} />
        <Route path="/community/:id/manage/events/create" element={<CreateEvent />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App

