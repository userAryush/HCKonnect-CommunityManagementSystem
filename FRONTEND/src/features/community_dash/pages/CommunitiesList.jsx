import { useEffect, useState } from 'react'
import apiClient from '../../../shared/services/apiClient'
import Navbar from "../../../shared/components/layout/Navbar";
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { getInitials } from '../../../utils/userUtils'

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

    // Using apiClient instead of raw axios to ensure token is attached
    apiClient
      .get('/communities/communities-list/')
      .then((res) => {
        if (!mounted) return
        setCommunities(res.data || [])
      })
      .catch((err) => {
        if (!mounted) return
        // Extract backend error message if available
        const msg = err.response?.data?.detail || err.response?.data?.msg || 'Failed to load communities.'
        setError(msg)
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
      await apiClient.post('/communities/memberships/apply/', { community: communityId })
      setSuccess('Application sent successfully.')
    } catch (err) {
      // Extract backend error message
      const msg = err.response?.data?.detail || err.response?.data?.msg || 'Could not send application.'
      setError(msg)
    } finally {
      setApplyingId(null)
      setTimeout(() => {
        setSuccess('')
        setError('')
      }, 3000)
    }
  }

  return (
    <div className="min-h-screen bg-secondary text-surface-dark">
      <Navbar navSolid={true} />
      <main className="pt-32 pb-16">
        <div className="mx-auto max-w-4xl px-6">
          <header className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
            <div className="max-w-xl">
              <h1 className="text-4xl font-display font-bold text-surface-dark">Find your <br /><span className="text-primary">Community.</span></h1>
              <p className="mt-4 text-surface-body text-sm">
                Discover communities where curiosity meets collaboration. From tech to arts, find the collective that speaks to you.
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-display italic text-primary/60">{communities.length}</span>
              <p className="text-[10px] uppercase tracking-widest text-surface-body font-bold">Available Communities</p>
            </div>
          </header>

          <div className="flex flex-col border-t border-surface-border">
            {communities.map((c) => (
              <Link
                key={c.id}
                to={`/community/${c.id}`}
                className="group flex flex-col md:flex-row md:items-center gap-8 py-10 border-b border-surface-border transition-all hover:bg-white/30 hover:px-6"
              >
                <div className="flex-shrink-0 relative">
                  {/* Logo container: rounded-full and removed rotate-3 */}
                  <div className="h-20 w-20 rounded-full bg-white shadow-sm border border-surface-border overflow-hidden flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                    {c.community_logo ? (
                      <img
                        src={c.community_logo}
                        alt={c.community_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-zinc-500">
                        {getInitials(c.community_name || 'Community')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-2xl font-bold tracking-tight text-surface-dark group-hover:text-primary transition-colors">
                      {c.community_name || c.username}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                      {c.member_count} Members
                    </span>
                  </div>
                  <p className="text-surface-body text-sm max-w-2xl line-clamp-1">
                    {c.community_description}
                  </p>
                </div>

                {/* View Arrow - adjusted for better alignment */}
                <div className="opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0 hidden md:block">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <span>View</span>
                    <ArrowRight size={18} />
                  </div>
                </div>
              </Link>

            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
