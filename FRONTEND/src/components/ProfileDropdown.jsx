import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { LogOut, User, Settings, ShieldCheck, Edit3 } from 'lucide-react'
import { getDisplayName, getInitials, getProfileImage } from '../utils/userUtils'
import Button from './shared/Button'

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { showToast } = useToast()

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
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 transition-all hover:bg-zinc-100 rounded-xl border border-transparent hover:border-zinc-200 group"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 font-bold text-[10px] ring-2 ring-transparent group-hover:ring-zinc-100 transition-all overflow-hidden border border-zinc-200 uppercase">
          {profileImage ? (
            <img src={profileImage} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <span className="hidden text-[13px] font-bold text-surface-dark lg:block max-w-[120px] truncate">{displayName}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-3 w-80 z-50 rounded-2xl border border-surface-border bg-white py-2 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-4 py-3 border-b border-zinc-100 mb-1">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Account</p>
              <p className="text-sm font-bold text-surface-dark mt-0.5 truncate">{user?.email}</p>
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
