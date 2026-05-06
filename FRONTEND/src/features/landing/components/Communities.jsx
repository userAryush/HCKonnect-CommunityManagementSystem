import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../../../shared/services/apiClient'
import { getInitials } from '../../../utils/userUtils'
import { ArrowUpRight } from 'lucide-react'
import SectionHeading from './SectionHeading'
import Reveal from './Reveal'

function shortDescription(text, max = 140) {
  if (!text || typeof text !== 'string') return ''
  const t = text.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max).trim()}…`
}

function CommunityShowcase() {
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await apiClient.get('/communities/communities-list/')
        if (!mounted) return
        const raw = res.data
        const list = Array.isArray(raw) ? raw : raw?.communities ?? []
        setCommunities(list)
        setError('')
      } catch {
        if (!mounted) return
        setError('Could not load communities right now.')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <section id="communities" className="relative bg-[#f3f7ef] px-5 py-20 sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <SectionHeading
            label="Community showcase"
            title="Spaces that are already live on HCKonnect."
            description="Explore active communities on HCKonnect. Tap any listing to view its full public profile, discover what they’re building, and see how you can get involved."
          />
        </Reveal>

        {error && (
          <p className="mt-8 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <Reveal className="mt-12" delay={0.08}>
          {loading ? (
            <ul className="flex flex-col gap-3">
              {[1, 2, 3, 4].map((i) => (
                <li
                  key={i}
                  className="h-[4.75rem] animate-pulse rounded-2xl bg-white/60 ring-1 ring-surface-border/60"
                />
              ))}
            </ul>
          ) : communities.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-surface-border bg-white/50 px-6 py-14 text-center text-sm text-surface-body">
              No communities to show yet. Check back soon.
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {communities.map((c) => {
                const name = c.community_name || c.username || 'Community'
                const desc = shortDescription(c.community_description)
                return (
                  <li key={c.id}>
                    <Link
                      to={`/community/${c.id}`}
                      className="group flex items-start gap-4 rounded-2xl border border-surface-border/80 bg-white p-4 shadow-sm transition hover:border-primary/35 hover:shadow-md"
                    >
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-surface-border bg-surface-muted-bg">
                        {c.community_logo ? (
                          <img
                            src={c.community_logo}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-bold text-primary">
                            {getInitials(name)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-display text-base font-semibold text-surface-dark group-hover:text-primary">
                            {name}
                          </h3>
                          <ArrowUpRight
                            className="mt-0.5 h-4 w-4 flex-shrink-0 text-surface-muted opacity-0 transition group-hover:opacity-100"
                            aria-hidden
                          />
                        </div>
                        {desc ? (
                          <p className="mt-1.5 text-sm leading-relaxed text-surface-body line-clamp-2">
                            {desc}
                          </p>
                        ) : (
                          <p className="mt-1.5 text-sm italic text-surface-muted">No description yet.</p>
                        )}
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </Reveal>
      </div>
    </section>
  )
}

export default CommunityShowcase
