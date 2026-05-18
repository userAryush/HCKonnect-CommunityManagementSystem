import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../../../shared/components/layout/Navbar'
import Footer from '../../../shared/components/layout/Footer'
import BackLink from '../../../shared/components/layout/BackLink'
import Button from '../../../shared/components/ui/Button'
import Badge from '../../../shared/components/ui/Badge'
import { CheckCircle, XCircle } from 'lucide-react'
import vacancyService from '../service/vacancyService'
import VacancyApplicationModal from '../components/VacancyApplicationModal'
import getApiErrorMessage from '../../../utils/getApiErrorMessage'
import { useAuth } from '../../authentication/components/AuthContext'
import { useToast } from '../../../shared/components/ui/ToastContext'
import { canApplyToVacancy, vacancyApplyBlockedReason } from '../../../utils/vacancyUtils'

export default function VacancyDetailPage() {
  const { communityId, vacancyId } = useParams()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [menuOpen, setMenuOpen] = useState(false)
  const [vacancy, setVacancy] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [applyOpen, setApplyOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!vacancyId) return
      setLoading(true)
      setError('')
      try {
        const data = await vacancyService.getVacancyPublic(vacancyId)
        if (!cancelled) setVacancy(data)
      } catch (err) {
        console.error(err)
        if (!cancelled) {
          setError(getApiErrorMessage(err, 'Could not load this vacancy.'))
          setVacancy(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [vacancyId])

  const mayApply = canApplyToVacancy(user)
  const blockedReason = vacancyApplyBlockedReason(user)
  const canApply =
    mayApply &&
    vacancy?.is_open &&
    !vacancy?.has_applied

  return (
    <div className="min-h-screen bg-secondary text-surface-dark">
      <Navbar
        menuOpen={menuOpen}
        toggleMenu={() => setMenuOpen((v) => !v)}
        closeMenu={() => setMenuOpen(false)}
        navSolid
      />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-24">
        <div className="mb-4">
          <BackLink to={communityId ? `/community/${communityId}` : '/feed'} />
        </div>

        {loading && (
          <div className="rounded-2xl border border-surface-border bg-white p-12 text-center text-surface-muted">
            Loading vacancy…
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center text-red-700">
            {error}
            <div className="mt-4">
              <Link to="/feed" className="font-semibold text-primary hover:underline">
                Back to feed
              </Link>
            </div>
          </div>
        )}

        {!loading && vacancy && (
          <article className="overflow-hidden rounded-3xl border border-surface-border bg-white shadow-sm">
            <div className="border-b border-surface-border bg-secondary/40 px-6 py-5 sm:px-8">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="orange">Vacancy</Badge>
                <Badge variant={vacancy.is_open ? 'success' : 'red'} className="flex items-center gap-1">
                  {vacancy.is_open ? (
                    <>
                      <CheckCircle size={12} /> Open
                    </>
                  ) : (
                    <>
                      <XCircle size={12} /> Closed
                    </>
                  )}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-surface-dark sm:text-3xl">
                {vacancy.title}
              </h1>
              {vacancy.community_name && (
                <p className="mt-2 text-sm text-surface-muted">
                  Posted by{' '}
                  <Link
                    to={`/community/${vacancy.community_id || communityId}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    {vacancy.community_name}
                  </Link>
                </p>
              )}
            </div>

            <div className="px-6 py-8 sm:px-8">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-surface-muted">
                Description
              </h2>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-surface-body leading-relaxed">
                {vacancy.description}
              </div>

              <div className="mt-10 flex flex-wrap gap-3 border-t border-surface-border pt-8">
                {vacancy.is_open && mayApply && (
                  <Button
                    onClick={() => setApplyOpen(true)}
                    disabled={!canApply}
                    className={
                      !canApply ? 'cursor-not-allowed opacity-60' : ''
                    }
                  >
                    {vacancy.has_applied ? 'Already applied' : 'Apply now'}
                  </Button>
                )}
                {vacancy.is_open && !mayApply && blockedReason && (
                  <p className="text-sm text-surface-muted">{blockedReason}</p>
                )}
                <Link to={communityId ? `/community/${communityId}` : '/feed'}>
                  <Button variant="secondary" type="button">
                    {communityId ? 'Community profile' : 'Back to feed'}
                  </Button>
                </Link>
              </div>
            </div>
          </article>
        )}
      </main>

      <Footer />

      {applyOpen && vacancy && (
        <VacancyApplicationModal
          vacancy={vacancy}
          onClose={() => setApplyOpen(false)}
          onSuccess={(msg) => {
            showToast(msg, 'success')
            setVacancy((v) => (v ? { ...v, has_applied: true } : v))
            setApplyOpen(false)
          }}
        />
      )}
    </div>
  )
}
