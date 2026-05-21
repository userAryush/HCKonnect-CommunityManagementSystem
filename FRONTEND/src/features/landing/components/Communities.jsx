import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../../../shared/services/apiClient'
import { getInitials } from '../../../utils/userUtils'
import SectionHeading from './SectionHeading'
import Reveal from './Reveal'

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
    return () => { mounted = false }
  }, [])

  const platformCommunity = communities.find((c) => c.is_platform_community)
  const memberCommunities = communities.filter((c) => !c.is_platform_community)

  const platformName =
    platformCommunity?.community_name ||
    platformCommunity?.username ||
    'Herald DevCorps'

  return (
    <section id="communities" className="relative bg-[#f3f7ef] px-5 py-20 sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <SectionHeading
            accent="communities"
            label="Community Showcase"
            description="Explore active communities on HCKonnect. Tap any listing to view its full public profile and see how you can get involved."
          />
        </Reveal>

        {error && (
          <p className="mt-8 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <Reveal className="mt-12" delay={0.08}>
          {loading ? (
            <div className="flex flex-col gap-6 rounded-3xl border border-surface-border/60 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:gap-8 sm:p-8">
              <div className="h-36 w-48 flex-shrink-0 animate-pulse rounded-2xl bg-surface-muted-bg" />
              <div className="hidden h-40 w-px bg-surface-border/50 sm:block" />
              <div className="grid flex-1 grid-cols-3 gap-4 sm:grid-cols-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-muted-bg" />
                ))}
              </div>
            </div>
          ) : communities.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-surface-border bg-white/50 px-6 py-14 text-center text-sm text-surface-body">
              No communities to show yet. Check back soon.
            </p>
          ) : (
            <div className="">
              <div className="flex flex-col sm:flex-row">

                {/* ── Left: Platform community ── */}
                {platformCommunity && (
                  <Link
                    to={`/community/${platformCommunity.id}`}
                    className="group relative flex flex-shrink-0 flex-col items-center justify-center gap-3 bg-surface-muted-bg/50 px-10 py-10 transition hover:bg-surface-muted-bg sm:w-64 sm:py-12"
                  >
                    {/* subtle circuit-board decoration echoing the HDC logo */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 opacity-[0.08]"
                    >
                      <svg width="120" height="28" viewBox="0 0 120 28" fill="none">
                        <line x1="10" y1="14" x2="110" y2="14" stroke="currentColor" strokeWidth="2"/>
                        <line x1="30" y1="14" x2="30" y2="24" stroke="currentColor" strokeWidth="2"/>
                        <line x1="60" y1="14" x2="60" y2="24" stroke="currentColor" strokeWidth="2"/>
                        <line x1="90" y1="14" x2="90" y2="24" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="30" cy="26" r="3" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="60" cy="26" r="3" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="90" cy="26" r="3" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="10" cy="14" r="3" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="110" cy="14" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>

                    {platformCommunity.community_logo ? (
                      <img
                        src={platformCommunity.community_logo}
                        alt={platformName}
                        className="h-24 w-auto max-w-[180px] object-contain transition group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-24 w-36 items-center justify-center rounded-2xl bg-primary/10">
                        <span className="font-display text-3xl font-bold text-primary">
                          {getInitials(platformName)}
                        </span>
                      </div>
                    )}

                    <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
                      Platform
                    </span>
                  </Link>
                )}

                {/* Dividers */}
                {platformCommunity && memberCommunities.length > 0 && (
                  <>
                    <div className="hidden w-px self-stretch bg-surface-border/50 sm:block" />
                    <div className="h-px w-full bg-surface-border/50 sm:hidden" />
                  </>
                )}

                {/* ── Right: Member communities logo grid ── */}
                {memberCommunities.length > 0 && (
                  <div className="flex flex-1 items-center p-6 sm:p-8">
                    <ul className="grid w-full grid-cols-3 gap-3 sm:grid-cols-4">
                      {memberCommunities.map((c) => {
                        const name = c.community_name || c.username || 'Community'
                        return (
                          <li key={c.id}>
                            <Link
                              to={`/community/${c.id}`}
                              title={name}
                              className="group flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-transparent p-3 transition hover:border-surface-border/60 hover:bg-surface-muted-bg/50"
                            >
                              {c.community_logo ? (
                                <img
                                  src={c.community_logo}
                                  alt={name}
                                  className="h-12 w-auto max-w-[96px] object-contain transition group-hover:scale-105 sm:h-[3.25rem]"
                                />
                              ) : (
                                <div className="flex h-12 w-16 items-center justify-center rounded-xl bg-surface-muted-bg sm:h-[3.25rem]">
                                  <span className="text-xs font-bold text-surface-body">
                                    {getInitials(name)}
                                  </span>
                                </div>
                              )}
                              <span className="max-w-full truncate text-center text-[11px] font-medium leading-tight text-surface-muted opacity-0 transition group-hover:opacity-100">
                                {name}
                              </span>
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}

              </div>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  )
}

export default CommunityShowcase