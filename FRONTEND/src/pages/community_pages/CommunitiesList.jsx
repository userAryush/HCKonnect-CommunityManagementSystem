import { useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from "../../components/Navbar";

import { Link } from 'react-router-dom'

const API_BASE_URL = 'http://localhost:8000'

export default function CommunitiesList() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [communities, setCommunities] = useState([])
  const [applyingId, setApplyingId] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')
    axios
      .get(`${API_BASE_URL}/communities/communities-list/`)
      .then((res) => {
        if (!mounted) return
        setCommunities(res.data || [])
      })
      .catch(() => {
        if (!mounted) return
        setError('Failed to load communities.')
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const handleApply = async (communityId) => {
    setApplyingId(communityId)
    setError('')
    setSuccess('')
    try {
      await axios.post(`${API_BASE_URL}/communities/memberships/apply/`, { community: communityId })
      setSuccess('Application sent successfully.')
    } catch {
      setError('Could not send application.')
    } finally {
      setApplyingId(null)
      setTimeout(() => {
        setSuccess('')
        setError('')
      }, 2000)
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
        <div className="mx-auto w-full max-w-7xl px-4">
          <header className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#75C043]">Communities</p>
            <h1 className="mt-2 text-3xl font-bold">Explore and Apply</h1>
          </header>

          {success && <div className="mb-4 rounded-xl bg-green-100 px-4 py-3 text-sm text-green-700">{success}</div>}
          {error && <div className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-700">{error}</div>}

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
                  <div className="h-6 w-24 animate-pulse rounded bg-[#f4f5f2]" />
                  <div className="mt-3 h-4 w-48 animate-pulse rounded bg-[#f4f5f2]" />
                  <div className="mt-5 h-10 w-full animate-pulse rounded bg-[#f4f5f2]" />
                </div>
              ))}
            </div>
          ) : communities.length === 0 ? (
            <div className="rounded-3xl border border-[#e5e7eb] bg-white p-10 text-center">
              <p className="text-[#4b4b4b]">No communities available.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {communities.map((c) => (
                <article key={c.id} className="flex flex-col rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    {c.community_logo ? (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white border border-[#75C043] shadow-sm">

                        <img
                          src={c.community_logo}
                          alt={c.community_name}
                          className="h-10 w-10 rounded-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f4f5f2] text-lg font-bold">
                        {c.community_name.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div>
                      <h3 className="text-lg font-semibold">{c.community_name}</h3>
                      <p className="text-xs text-[#4b4b4b]">{c.member_count} members</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-[#4b4b4b]">{c.community_description}</p>
                  <div className="mt-5 flex gap-3">
                    <Link
                      to={`/community/${c.id}`}
                      className="rounded-xl border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-bold text-[#0d1f14] transition hover:bg-[#f4f5f2]"
                    >
                      View
                    </Link>
                    {/* {c.vacancy?.is_open ? (
                      <button
                        onClick={() => handleApply(c.id)}
                        disabled={applyingId === c.id}
                        className="rounded-xl bg-[#75C043] px-4 py-2 text-sm font-bold text-[#0f1a12] shadow-lg shadow-[#75C043]/20 transition hover:bg-[#68ae3b] disabled:opacity-70"
                      >
                        {applyingId === c.id ? 'Applying…' : 'Apply'}
                      </button>
                    ) : (
                      <span className="rounded-xl bg-[#f4f5f2] px-4 py-2 text-sm font-semibold text-[#4b4b4b]">No vacancies</span>
                    )} */}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
