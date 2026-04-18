import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import vacancyService from '../../services/vacancyService'
import Button from '../../components/shared/Button'
import { useToast } from '../../context/ToastContext'
import PageHeader from '../../components/shared/PageHeader'

export default function CreateVacancy() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [menuOpen, setMenuOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('OPEN')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      const message = 'Title is required.'
      setError(message)
      showToast(message, 'error')
      return
    }

    if (!description.trim()) {
      const message = 'Description is required.'
      setError(message)
      showToast(message, 'error')
      return
    }

    try {
      setLoading(true)
      await vacancyService.createVacancy({
        title,
        description,
        status,
      })
      showToast('Vacancy created successfully.', 'success')
      setTitle('')
      setDescription('')
      setStatus('OPEN')
      setTimeout(() => {
        navigate(`/community/${id}/dashboard`)
      }, 1500)
    } catch (err) {
      console.error(err)
      const message =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'Failed to create vacancy. Ensure you have proper permissions.'
      setError(message)
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary text-[#0d1f14]">
      <Navbar
        menuOpen={menuOpen}
        toggleMenu={() => setMenuOpen((v) => !v)}
        closeMenu={() => setMenuOpen(false)}
        navSolid={true}
      />
      <main className="pt-24 pb-16">
        <div className="mx-auto w-full max-w-5xl px-4">
          <PageHeader
            title="Create Vacancy"
            subtitle="Find the next valuable member of your community team."
            backLinkTo={`/community/${id}/dashboard`}
            backLinkText="Dashboard"
          />

          {error && <div className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-700">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <div>
              <label className="mb-2 block text-sm font-semibold">Position</label>
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

            <div>
              <label htmlFor="status" className="mb-2 block text-sm font-semibold">Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-[#e5e7eb] bg-white px-4 py-2 text-sm outline-none focus:border-[#75C043]"
              >
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div className="pt-2">
              <Button
                type="Create"
                disabled={loading}
                isLoading={loading}
                loadingText="Creating..."
                className="px-6"
              >
                Submit
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
