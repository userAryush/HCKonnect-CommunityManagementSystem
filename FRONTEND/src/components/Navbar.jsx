import { useLocation, Link, useParams, useNavigate } from 'react-router-dom'
import ProfileDropdown from './ProfileDropdown'
import logo from '../assets/favicon.png'
import { Search, User as UserIcon, Users, Loader2, Bell, Menu, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import apiClient from '../services/apiClient'
import { useAuth } from '../context/AuthContext'
import NotificationPopover from './notifications/NotificationPopover'
import notificationService from '../services/notificationService'
import { getDisplayName, getInitials, getProfileImage } from '../utils/userUtils'

const studentLinks = [
  { label: 'Home', href: '/feed' },
  { label: 'Communities', href: '/communities' },
  { label: 'Discussions', href: '/discussions' },
  { label: 'Posts', href: '/posts' },
]

const adminLinks = (communityId) => [
  { label: 'Dashboard', href: `/community/${communityId}/dashboard` },
  { label: 'Discussions', href: `/discussions?community_id=${communityId}` },
  { label: 'Posts', href: '/posts' },
  { label: 'Feed', href: '/feed' },
]

function Navbar({ menuOpen = false, toggleMenu = () => { }, closeMenu = () => { }, navSolid = false }) {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { id } = useParams()
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
    const interval = setInterval(fetchUnreadCount, 15000)
    return () => clearInterval(interval)
  }, [user])

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

  const baseStyles = 'fixed inset-x-0 top-0 z-50 transition-all duration-300 backdrop-blur-md border-b'
  const transparent = 'bg-transparent border-transparent'
  const solid = 'bg-white/90 border-surface-border shadow-sm'

  let navLinks = studentLinks
  if (user?.role === 'community') {
    navLinks = adminLinks(user.id)
  } else if (isAdminRoute && id) {
    navLinks = adminLinks(id)
  }

  return (
    <header className={`${baseStyles} ${navSolid ? solid : transparent}`}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4 md:gap-8">

          {/* ZONE 1: BRAND */}
          <Link
            to={isLanding ? '/' : '/feed'}
            onClick={closeMenu}
            className="flex-shrink-0 flex flex-col group"
          >
            <div className="flex items-center gap-2 group cursor-pointer">
              <img src={logo} alt="logo" className="h-8 w-8 rounded-lg transition-transform group-hover:scale-105" />

              <span className="text-xl text-primary font-display font-bold tracking-tight">
                HCKonnect
              </span>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-surface-muted mt-0.5 ml-0.5">
              Herald Community Konnect
            </span>
          </Link>

          {/* ZONE 2: SEARCH */}
          {!isLanding && (
            <div className="hidden md:flex flex-1 justify-center max-w-md relative" ref={dropdownRef}>
              <div className="relative w-full group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="Search anything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-100/80 border border-transparent rounded-xl py-2 pl-10 pr-4 text-sm transition-all focus:bg-white focus:ring-4 focus:ring-zinc-100 focus:border-zinc-200 outline-none placeholder:text-zinc-500 font-medium"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-primary" size={16} />
                )}
              </div>

              {showDropdown && searchQuery.trim().length > 1 && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-surface-border rounded-2xl shadow-xl overflow-hidden z-[60]">
                  {isSearching ? (
                    <div className="p-8 flex flex-col items-center justify-center gap-3">
                      <Loader2 className="animate-spin text-primary" size={20} />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Searching...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2 max-h-[420px] overflow-y-auto">
                      {searchResults.map((result) => (
                        <button
                          key={`${result.type}-${result.id}`}
                          onClick={() => handleSelectResult(result)}
                          className="w-full flex items-center gap-3.5 px-4 py-3 hover:bg-zinc-50 transition-all group text-left"
                        >
                          <div className="h-10 w-10 rounded-full border border-zinc-100 overflow-hidden bg-zinc-50 flex-shrink-0 flex items-center justify-center">
                            {result.image ? (
                              <img src={result.image} alt={result.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-zinc-400 font-bold text-xs bg-zinc-100">
                                {getInitials(result.name)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-surface-dark truncate group-hover:text-primary transition-colors">
                              {result.name}
                            </p>
                            <p className="text-xs text-zinc-400 truncate mt-0.5">
                              {result.type === 'student' ? `@${result.username}` : 'Community'}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-sm font-medium text-surface-dark">No matches found</p>
                      <p className="text-xs text-zinc-400 mt-1">Try a different search term.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ZONE 3: NAV & ACTIONS */}
          <div className="flex items-center gap-2 md:gap-4">
            <nav className="hidden xl:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href
                return (
                  <Link
                    key={link.label}
                    to={link.href}
                    className={`px-4 py-2 text-sm font-semibold transition-colors rounded-lg ${
                      isActive 
                        ? 'text-primary bg-primary/5' 
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            <div className="flex items-center gap-1 sm:gap-4 md:pl-4 xl:border-l border-zinc-100">
              {!user ? (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="px-4 py-2 text-sm font-bold text-zinc-600 hover:text-zinc-900 transition-colors">Login</Link>
                  <Link to="/register" className="bg-primary text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md shadow-primary/20 hover:bg-primary-hover transition-all">Join</Link>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <div className="relative" ref={notificationRef}>
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className={`p-2.5 rounded-xl transition-all ${
                        showNotifications 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600'
                      }`}
                    >
                      <Bell size={20} />
                      {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-3.5 w-3.5 bg-primary text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    <NotificationPopover isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
                  </div>
                  <ProfileDropdown />
                </div>
              )}

              {/* Mobile Toggle */}
              <button 
                onClick={toggleMenu} 
                className="lg:hidden p-2 text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
              >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar

