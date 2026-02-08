import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const displayName = user?.username || user?.email || 'User'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 pl-1 pr-3 py-1.5 transition hover:bg-white/10 rounded-full border border-white/20"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#75C043] text-[#0d1f14] font-bold text-sm">
          {initial}
        </div>
        <span className="hidden text-sm font-medium text-white lg:block max-w-[100px] truncate">{displayName}</span>

      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 z-50 rounded-xl border border-white/10 bg-[#0d1f14] py-2 shadow-xl ring-1 ring-black/5">
            <Link
              to="/profile"
              className="block px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              View Profile
            </Link>
            <Link
              to="/profile/edit"
              className="block px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              Edit Profile
            </Link>
            <Link
              to="/settings"
              className="block px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              Settings
            </Link>
            <Link
              to="/change-password"
              className="block px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              Change Password
            </Link>
            <hr className="my-1 border-white/10" />
            <button
              onClick={handleLogout}
              className="block w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/10 hover:text-red-300"
            >
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  )
}
