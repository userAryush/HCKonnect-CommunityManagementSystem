import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    // Implement logout logic here
    navigate('/')
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-1 py-1.5 transition hover:bg-white/20 rounded-full"
      >
        <img
          src="https://ui-avatars.com/api/?name=User&background=random"
          alt="Profile"
          className="h-8 w-8 rounded-full"
        />
        <span className="hidden text-sm font-medium text-white lg:block">User</span>

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
