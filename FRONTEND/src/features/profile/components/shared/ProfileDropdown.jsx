import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../authentication/components/AuthContext'
import { useToast } from '../../../../shared/components/ui/ToastContext'
import { LogOut, User, Settings, ShieldCheck, Edit3, Moon, Sun } from 'lucide-react'
import { getDisplayName, getInitials, getProfileImage } from '../../../../utils/userUtils'
import Button from '../../../../shared/components/ui/Button'
import { useTheme } from '../../../../shared/context/ThemeContext'

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { showToast } = useToast()
  const { isDark, toggleTheme } = useTheme()

  const handleLogout = () => {
    setIsLoggingOut(true)
    setTimeout(() => {
      logout()
      showToast('successfully logged out.', 'success')
      navigate('/login')
    }, 500)
  }

  const displayName = getDisplayName(user)
  const profileImage = getProfileImage(user)
  const initials = getInitials(displayName)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Open profile menu for ${displayName}`}
        aria-expanded={isOpen}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all hover:bg-zinc-100 border border-transparent hover:border-zinc-200 group"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 font-bold text-[10px] ring-2 ring-transparent group-hover:ring-zinc-100 transition-all overflow-hidden border border-zinc-200 uppercase">
          {profileImage ? (
            <img src={profileImage} alt="" className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </div>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-3 w-80 z-50 rounded-2xl border border-surface-border bg-white py-2 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-4 py-3 border-b border-zinc-100 mb-1">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-surface-dark truncate">{displayName}</p>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-surface-border text-surface-muted hover:text-primary hover:bg-zinc-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? <Sun size={16} /> : <Moon size={16} />}
                </button>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5 truncate">{user?.email}</p>
            </div>

            <Link
              to={user?.role === 'community' ? `/community/${user.id}` : (user?.membership?.role === 'representative' ? `/community/${user.membership.community_id}` : "/profile")}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-primary transition-colors font-semibold"
              onClick={() => setIsOpen(false)}
            >
              <User size={16} />
              View Profile
            </Link>
            <Link
              to={user?.role === 'community' ? `/profile/edit` : (user?.membership?.role === 'representative' ? `/profile/edit/${user.membership.community_id}` : "/profile/edit")}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-primary transition-colors font-semibold"
              onClick={() => setIsOpen(false)}
            >
              <Edit3 size={16} />
              Edit Profile
            </Link>
            {/* <Link
              to="/settings"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-primary transition-colors font-semibold"
              onClick={() => setIsOpen(false)}
            >
              <Settings size={16} />
              Settings
            </Link> */}
            <Link
              to="/profile/edit#change-password"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-primary transition-colors font-semibold"
              onClick={() => setIsOpen(false)}
            >
              <ShieldCheck size={16} />
              Change Password
            </Link>

            <div className="my-1 border-t border-zinc-100" />

            <div className="px-2 pb-2">
              <Button
                onClick={handleLogout}
                variant="ghost"
                isLoading={isLoggingOut}
                loadingText="Logging out..."
                className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600"
              >
                {!isLoggingOut && <LogOut size={16} className="mr-3" />}
                Logout
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
