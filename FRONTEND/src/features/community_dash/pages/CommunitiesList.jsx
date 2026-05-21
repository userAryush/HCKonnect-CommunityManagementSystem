import { useEffect, useState } from 'react'
import apiClient from '../../../shared/services/apiClient'
import Navbar from '../../../shared/components/layout/Navbar'
import { Link } from 'react-router-dom'
import { ArrowRight, Users } from 'lucide-react'
import { getInitials } from '../../../utils/userUtils'
import { CommunitiesListSkeleton } from '../../../shared/components/layout/Skeleton'
import Footer from '../../../shared/components/layout/Footer'

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
        const raw = res.data
        const list = Array.isArray(raw) ? raw : raw?.communities ?? []
        setCommunities(list)
      })
      .catch((err) => {
        if (!mounted) return
        const msg =
          err.response?.data?.detail ||
          err.response?.data?.msg ||
          'Failed to load communities.'
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

  const platformCommunity = communities.find((c) => c.is_platform_community)
  const memberCommunities = communities.filter((c) => !c.is_platform_community)

  const platformName =
    platformCommunity?.community_name ||
    platformCommunity?.username ||
    'Herald DevCorps'

  const memberCount = memberCommunities.length + (platformCommunity ? 1 : 0)

  return (
    <div className="min-h-screen bg-[#f7f8f5] text-surface-dark">
      <Navbar navSolid={true} />

      <main className="pt-28 pb-20">
        <div className="mx-auto max-w-6xl px-6">
          <header className="mb-12">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-[2.6rem] font-display font-bold leading-tight text-surface-dark">
                  Find your <span className="text-primary">Community</span>
                  
                </h1>
              </div>
              {!loading && (
                <div className="pb-1 text-right">
                  <span className="text-4xl font-display font-bold text-primary/30">
                    {memberCount}
                  </span>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-surface-body">
                    Communities
                  </p>
                </div>
              )}
            </div>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-surface-body">
              Discover communities where curiosity meets collaboration. From tech to
              arts, find the collective that speaks to you.
            </p>
          </header>

          {error && (
            <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && communities.length === 0 && (
            <p className="rounded-2xl border border-dashed border-surface-border bg-white/50 px-6 py-14 text-center text-sm text-surface-body">
              No communities available yet.
            </p>
          )}

          {!loading && !error && communities.length > 0 && (
            <div className="">
              <div className="flex flex-col sm:flex-row">
                {platformCommunity && (
                  <Link
                    to={`/community/${platformCommunity.id}`}
                    className="group relative flex flex-shrink-0 flex-col items-center justify-center gap-4 bg-surface-muted-bg/50 px-8 py-10 transition hover:bg-surface-muted-bg sm:w-72 sm:px-10 sm:py-12"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 opacity-[0.08]"
                    >
                      <svg width="120" height="28" viewBox="0 0 120 28" fill="none">
                        <line x1="10" y1="14" x2="110" y2="14" stroke="currentColor" strokeWidth="2" />
                        <line x1="30" y1="14" x2="30" y2="24" stroke="currentColor" strokeWidth="2" />
                        <line x1="60" y1="14" x2="60" y2="24" stroke="currentColor" strokeWidth="2" />
                        <line x1="90" y1="14" x2="90" y2="24" stroke="currentColor" strokeWidth="2" />
                        <circle cx="30" cy="26" r="3" stroke="currentColor" strokeWidth="2" />
                        <circle cx="60" cy="26" r="3" stroke="currentColor" strokeWidth="2" />
                        <circle cx="90" cy="26" r="3" stroke="currentColor" strokeWidth="2" />
                        <circle cx="10" cy="14" r="3" stroke="currentColor" strokeWidth="2" />
                        <circle cx="110" cy="14" r="3" stroke="currentColor" strokeWidth="2" />
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

                    <div className="text-center">
                      <h2 className="text-lg font-bold text-surface-dark">{platformName}</h2>
                      {platformCommunity.community_description && (
                        <p className="mt-1 line-clamp-2 max-w-[220px] text-xs leading-relaxed text-surface-body">
                          {platformCommunity.community_description}
                        </p>
                      )}
                    </div>

                    <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
                      Platform
                    </span>

                    <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition group-hover:opacity-100">
                      View profile <ArrowRight size={14} />
                    </span>
                  </Link>
                )}

                {platformCommunity && memberCommunities.length > 0 && (
                  <>
                    <div className="hidden w-px self-stretch bg-surface-border/50 sm:block" />
                    <div className="h-px w-full bg-surface-border/50 sm:hidden" />
                  </>
                )}

                {memberCommunities.length > 0 && (
                  <div className="flex flex-1 flex-col p-6 sm:p-8">
                    {platformCommunity && (
                      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-surface-muted">
                        Student communities
                      </p>
                    )}
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
        </div>

        {loading && <CommunitiesListSkeleton />}

        {!loading && !error && platformCommunity && (
          <section className="mt-10 w-full bg-white py-10 sm:py-12">
            <div className="mx-auto w-full max-w-6xl px-6">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
                {platformCommunity.community_logo ? (
                  <img
                    src={platformCommunity.community_logo}
                    alt={platformName}
                    className="h-20 w-auto max-w-[160px] flex-shrink-0 object-contain sm:h-24 sm:max-w-[180px]"
                  />
                ) : (
                  <div className="flex h-20 w-32 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 sm:h-24 sm:w-36">
                    <span className="font-display text-2xl font-bold text-primary sm:text-3xl">
                      {getInitials(platformName)}
                    </span>
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-surface-dark sm:text-2xl">
                      {platformName}
                    </h2>
                    <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
                      Platform community
                    </span>
                  </div>

                  {platformCommunity.community_description ? (
                    <p className="text-sm leading-relaxed text-surface-body sm:text-base">
                      {platformCommunity.community_description}
                    </p>
                  ) : null}

                  <p className="mt-4 text-sm leading-relaxed text-surface-muted">
                    Every student community on HCKonnect operates under{' '}
                    <span className="font-semibold text-surface-dark">{platformName}</span>.
                    It coordinates the platform, supports member communities, and handles
                    shared services so each group can focus on its own members and activities.
                  </p>

                  <Link
                    to={`/community/${platformCommunity.id}`}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:gap-2"
                  >
                    View platform profile <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="mx-auto max-w-6xl px-6">
          {!loading && !error && memberCommunities.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-surface-muted">
                Browse all communities
              </h2>
              <div className="flex flex-col gap-3">
                {memberCommunities.map((c, idx) => {
                  const name = c.community_name || c.username || 'Community'
                  return (
                    <Link
                      key={c.id}
                      to={`/community/${c.id}`}
                      style={{ animationDelay: `${idx * 60}ms` }}
                      className="group flex animate-fadeIn items-center gap-6 rounded-2xl border border-gray-100 p-5 transition-all duration-200 hover:border-primary/20"
                    >
                      {c.community_logo ? (
                        <img
                          src={c.community_logo}
                          alt={name}
                          className="h-12 w-auto max-w-[96px] flex-shrink-0 object-contain transition group-hover:scale-105 sm:h-[3.25rem]"
                        />
                      ) : (
                        <div className="flex h-12 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-surface-muted-bg sm:h-[3.25rem]">
                          <span className="text-xs font-bold text-surface-body">
                            {getInitials(name)}
                          </span>
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex items-center gap-2">
                          <h3 className="truncate text-[15px] font-semibold text-surface-dark transition-colors">
                            {name}
                          </h3>
                          <span className="flex flex-shrink-0 items-center gap-1 rounded-full bg-primary/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                            <Users size={9} />
                            {c.member_count}
                          </span>
                        </div>
                        <p className="line-clamp-1 text-[13px] leading-relaxed text-surface-body">
                          {c.community_description}
                        </p>
                      </div>

                      <div className="flex flex-shrink-0 items-center gap-1 text-[13px] font-medium text-primary opacity-0 transition-all duration-200 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100">
                        <span>View</span>
                        <ArrowRight size={15} />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />

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
