import { useEffect, useState } from 'react'
import apiClient from '../../../shared/services/apiClient'
import Navbar from "../../../shared/components/layout/Navbar";
import { Link } from 'react-router-dom'
import { ArrowRight, Users } from 'lucide-react'
import { getInitials } from '../../../utils/userUtils'
import { CommunitiesListSkeleton } from '../../../shared/components/layout/Skeleton'

export default function CommunitiesList() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [communities, setCommunities] = useState([])

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')

    apiClient
      .get('/communities/communities-list/')
      .then((res) => {
        if (!mounted) return
        setCommunities(res.data || [])
      })
      .catch((err) => {
        if (!mounted) return
        const msg = err.response?.data?.detail || err.response?.data?.msg || 'Failed to load communities.'
        setError(msg)
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => { mounted = false }
  }, [])

  return (
    <div className="min-h-screen bg-[#f7f8f5] text-surface-dark">
      <Navbar navSolid={true} />

      <main className="pt-28 pb-20">
        <div className="mx-auto max-w-6xl px-6">

          {/* Header */}
          <header className="mb-12">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-[2.6rem] font-display font-bold leading-tight text-surface-dark">
                  Find your<br />
                  <span className="text-primary">Community.</span>
                </h1>
              </div>
              {!loading && (
                <div className="text-right pb-1">
                  <span className="text-4xl font-display font-bold text-primary/30">{communities.length}</span>
                  <p className="text-[10px] uppercase tracking-widest text-surface-body font-semibold mt-0.5">
                    Communities
                  </p>
                </div>
              )}
            </div>
            <p className="mt-5 text-surface-body text-sm max-w-md leading-relaxed">
              Discover communities where curiosity meets collaboration. From tech to arts, find the collective that speaks to you.
            </p>
          </header>

          {/* Error */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
              {error}
            </div>
          )}

          {loading && <CommunitiesListSkeleton rows={4} />}

          {/* Communities list */}
          {!loading && !error && (
            <div className="flex flex-col gap-3">
              {communities.map((c, idx) => (
                <Link
                  key={c.id}
                  to={`/community/${c.id}`}
                  style={{ animationDelay: `${idx * 60}ms` }}
                  className="group bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 hover:border-primary/20 hover:shadow-sm transition-all duration-200 animate-fadeIn"
                >
                  {/* Logo */}
                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0 group-hover:border-primary/20 transition-colors">
                    {c.community_logo ? (
                      <img
                        src={c.community_logo}
                        alt={c.community_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold text-gray-400">
                        {getInitials(c.community_name || 'Community')}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-[15px] font-semibold text-surface-dark  transition-colors truncate">
                        {c.community_name || c.username}
                      </h3>
                      <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-primary bg-primary/8 px-2 py-0.5 rounded-full">
                        <Users size={9} />
                        {c.member_count}
                      </span>
                    </div>
                    <p className="text-[13px] text-surface-body line-clamp-1 leading-relaxed">
                      {c.community_description}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0 flex items-center gap-1 text-primary text-[13px] font-medium opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200">
                    <span>View</span>
                    <ArrowRight size={15} />
                  </div>
                </Link>
              ))}

              {communities.length === 0 && (
                <div className="text-center py-20 text-surface-body text-sm">
                  No communities available yet.
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease both;
        }
      `}</style>
    </div>
  )
}