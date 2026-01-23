import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../../components/Navbar'

const API_BASE_URL = 'http://localhost:8000'

export default function CreateVacancy() {
  const { id } = useParams()
  const [menuOpen, setMenuOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isOpen, setIsOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!title.trim()) {
      setError('Title is required.')
      return
    }
    if (!description.trim()) {
      setError('Description is required.')
      return
    }
    try {
      setLoading(true)
      await axios.post(`${API_BASE_URL}/communities/community-vacancy/`, {
        community: id,
        title,
        description,
        is_open: isOpen,
      })
      setSuccess('Vacancy created successfully.')
      setTitle('')
      setDescription('')
      setIsOpen(true)
    } catch {
      setError('Failed to create vacancy.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f5f2] text-[#0d1f14]">
      <Navbar
        menuOpen={menuOpen}
        toggleMenu={() => setMenuOpen((v) => !v)}
        closeMenu={() => setMenuOpen(false)}
        navSolid={true}
      />
      <main className="pt-24 pb-16">
        <div className="mx-auto w-full max-w-5xl px-4">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Create Vacancy</h1>
              <p className="text-[#4b4b4b]">Open positions for your community</p>
            </div>
            <Link
              to={`/community/${id}/dashboard`}
              className="rounded-xl border border-[#e5e7eb] bg-white px-6 py-2 text-sm font-bold text-[#0d1f14] transition hover:bg-[#f4f5f2]"
            >
              Back to Dashboard
            </Link>
          </header>

          {success && <div className="mb-4 rounded-xl bg-green-100 px-4 py-3 text-sm text-green-700">{success}</div>}
          {error && <div className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-700">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <div>
              <label className="mb-2 block text-sm font-semibold">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-[#e5e7eb] bg-white px-4 py-2 text-sm outline-none focus:border-[#75C043]"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">Description</label>
              <textarea
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full resize-none rounded-xl border border-[#e5e7eb] bg-white px-4 py-2 text-sm outline-none focus:border-[#75C043]"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                id="isOpen"
                type="checkbox"
                checked={isOpen}
                onChange={(e) => setIsOpen(e.target.checked)}
                className="h-4 w-4 accent-[#75C043]"
              />
              <label htmlFor="isOpen" className="text-sm font-semibold">Vacancy is open</label>
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-[#75C043] px-6 py-2 text-sm font-bold text-[#0f1a12] shadow-lg shadow-[#75C043]/20 transition hover:bg-[#68ae3b] disabled:opacity-70"
              >
                {loading ? 'Submitting…' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
