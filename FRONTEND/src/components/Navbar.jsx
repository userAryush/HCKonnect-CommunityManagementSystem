import { useLocation, Link, useParams, useNavigate } from 'react-router-dom'
import ProfileDropdown from './ProfileDropdown'
import logo from '../assets/logo.png'
import { Search, User as UserIcon, Users, Loader2, Bell } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import apiClient from '../services/apiClient'

const studentLinks = [
  { label: 'Home', href: '/feed' },
  { label: 'Communities', href: '/communities' },
  { label: 'Discussions', href: '/discussions' },
  { label: 'Posts', href: '/posts' },
  { label: 'Notifications', href: '#notifications' },
]

const adminLinks = (communityId) => [
  { label: 'Dashboard', href: `/community/${communityId}/dashboard` },
  { label: 'Discussions', href: `/discussions?community_id=${communityId}` },
  { label: 'Posts', href: '/posts' },
  { label: 'Feed', href: '/feed' },
  { label: 'Notifications', href: '#notifications' },
]

import { useAuth } from '../context/AuthContext'
import NotificationPopover from './notifications/NotificationPopover'
import notificationService from '../services/notificationService'

function Navbar({ menuOpen = false, toggleMenu = () => { }, closeMenu = () => { }, navSolid = false, rightActions = null }) {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { id } = useParams() // Get community ID from URL if available
  const isLanding = location.pathname === '/'
  const isAdminRoute = location.pathname.includes('/dashboard') || location.pathname.includes('/manage')

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const dropdownRef = useRef(null)
  const notificationRef = useRef(null)
  const mobileNotificationRef = useRef(null)

  // Handle outside click to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
      if (
        notificationRef.current && !notificationRef.current.contains(event.target) &&
        mobileNotificationRef.current && !mobileNotificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch unread count and set up polling
  useEffect(() => {
    if (!user) return

    const fetchUnreadCount = async () => {
      try {
        const data = await notificationService.getNotifications()
        setUnreadCount(data.filter(n => !n.is_read).length)
      } catch (error) {
        console.error('Error fetching unread count')
      }
    }

    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 15000) // Poll every 15s
    return () => clearInterval(interval)
  }, [user])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true)
        setShowDropdown(true)
        try {
          const response = await apiClient.get(`/accounts/global-search/?q=${searchQuery}`)
          setSearchResults(response.data)
        } catch (error) {
          console.error('Search error:', error)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
        setShowDropdown(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSelectResult = (result) => {
    setSearchQuery('')
    setShowDropdown(false)
    if (result.type === 'student') {
      navigate(`/profile/${result.id}`)
    } else {
      navigate(`/community/${result.id}`)
    }
  }

  const baseStyles =
    'fixed inset-x-0 top-0 z-50 border-b border-white/10 backdrop-blur-lg transition-colors duration-300'
  const transparent = 'bg-transparent text-white'
  const solid = 'bg-[#0d1f14]/95 text-white shadow-xl'

  // Determine links based on route
  // Filter out Notifications from the standard links as we'll show it as an icon
  let navLinks = studentLinks.filter(l => l.label !== 'Notifications')
  // Prioritize user role if logged in
  if (user?.role === 'community') {
    navLinks = adminLinks(user.id).filter(l => l.label !== 'Notifications')
  } else if (isAdminRoute && id) {
    navLinks = adminLinks(id).filter(l => l.label !== 'Notifications')
  }

  return (
    <header className={`${baseStyles} ${navSolid ? solid : transparent}`}>
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link
          to={isLanding ? '/' : '/feed'}
          onClick={closeMenu}
          className="flex flex-col items-start gap-1"
        >
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="HCKonnect logo"
              className="h-8 w-8 rounded-full"
            />
            <span className="text-lg font-semibold tracking-wide">
              HCKonnect
            </span>
          </div>
          <span className="text-xs uppercase text-white/70">
            Herald Community Konnect
          </span>
        </Link>

        {/* Global Search */}
        {!isLanding && (
          <div className="hidden flex-1 max-w-md mx-8 lg:block relative" ref={dropdownRef}>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#75C043] transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search people or communities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length > 1 && setShowDropdown(true)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-12 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#75C043]/50 focus:bg-white/10 transition-all"
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Loader2 className="animate-spin text-[#75C043]" size={16} />
                </div>
              )}
            </div>

            {/* Search Dropdown */}
            {showDropdown && (searchQuery.trim().length > 1) && (
              <div className="absolute top-full mt-2 w-full bg-[#0d1f14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[60] backdrop-blur-xl">
                {searchResults.length > 0 ? (
                  <div className="py-2 max-h-[400px] overflow-y-auto">
                    {searchResults.map((result) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleSelectResult(result)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                      >
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                          {result.image ? (
                            <img src={result.image} alt={result.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-white/40">
                              {result.type === 'student' ? <UserIcon size={20} /> : <Users size={20} />}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{result.name}</p>
                          <p className="text-xs text-white/50 truncate">
                            {result.type === 'student' ? `@${result.username}` : 'Community'}
                          </p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${result.type === 'student' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                          } uppercase font-bold tracking-wider`}>
                          {result.type}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  !isSearching && (
                    <div className="p-8 text-center">
                      <p className="text-sm text-white/40">No results found for "{searchQuery}"</p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}


        <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="text-white/80 transition hover:text-white"
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {rightActions}
          {isLanding ? (
            <>
              <Link to="/login" className="rounded-full border border-white/40 px-5 py-2 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10">
                Login
              </Link>
              <Link to="/register" className="rounded-full bg-[#75C043] px-5 py-2 text-sm font-semibold text-[#0f1a12] shadow-lg shadow-[#75C043]/40 transition hover:scale-105">
                Get Started
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all relative group"
                  aria-label="View notifications"
                >
                  <Bell size={22} className={showNotifications ? 'text-[#75C043]' : ''} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-4 min-w-[1rem] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 border-2 border-[#0d1f14]">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <NotificationPopover
                  isOpen={showNotifications}
                  onClose={() => setShowNotifications(false)}
                />
              </div>
              <ProfileDropdown />
            </div>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-2 lg:hidden">
          {user && !isLanding && (
            <div className="relative" ref={mobileNotificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all relative"
                aria-label="View notifications"
              >
                <Bell size={22} className={showNotifications ? 'text-[#75C043]' : ''} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-4 min-w-[1rem] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 border-2 border-[#0d1f14]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <NotificationPopover
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
              />
            </div>
          )}
          <button
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/30"
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
          >
            <span
              className={`absolute h-0.5 w-6 bg-white transition-all ${menuOpen ? 'translate-y-0 rotate-45' : '-translate-y-2'
                }`}
            />
            <span className={`h-0.5 w-6 bg-white transition ${menuOpen ? 'opacity-0' : 'opacity-100'}`} />
            <span
              className={`absolute h-0.5 w-6 bg-white transition-all ${menuOpen ? 'translate-y-0 -rotate-45' : 'translate-y-2'
                }`}
            />
          </button>
        </div>
      </div>

      <div
        className={`lg:hidden ${menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'} transition`}
      >
        <div className="mx-4 mt-2 rounded-3xl bg-[#0d1f14]/95 p-6 shadow-2xl ring-1 ring-white/10">
          <nav className="flex flex-col gap-4 text-base font-semibold text-white/90">
            {navLinks.map((link) => (
              <Link key={link.label} to={link.href} onClick={closeMenu} className="hover:text-white">
                {link.label}
              </Link>
            ))}
            {user && (
              <button
                onClick={() => {
                  toggleMenu();
                  setShowNotifications(true);
                }}
                className="text-left hover:text-white flex items-center justify-between"
              >
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}
          </nav>
          <div className="mt-6 flex flex-col gap-3">
            {isLanding ? (
              <>
                <Link to="/login" className="rounded-full border border-white/30 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10">
                  Login
                </Link>
                <Link to="/register" className="rounded-full bg-[#75C043] px-5 py-3 text-center text-sm font-semibold text-[#0f1a12] shadow-lg shadow-[#75C043]/40 transition hover:scale-105">
                  Get Started
                </Link>
              </>
            ) : (
              <div className="flex justify-center">
                <ProfileDropdown />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}


export default Navbar

