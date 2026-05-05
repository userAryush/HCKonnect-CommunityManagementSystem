import { useNavigate } from 'react-router-dom'
import SectionHeading from './SectionHeading'
import Reveal from './Reveal'

function FinalCTA() {
  const navigate = useNavigate()
  const isAuthenticated = Boolean(localStorage.getItem('access_token'))

  return (
    <section className="relative overflow-hidden bg-surface-dark px-5 py-16 sm:px-8 sm:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(117,191,68,0.35),transparent)]" />

      <Reveal>
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-8 rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8 text-center shadow-2xl shadow-black/30 backdrop-blur-sm sm:p-10 lg:p-12">
          <SectionHeading
            theme="dark"
            label="Start today"
            title="Your community already has stories worth sharing."
            description={
              isAuthenticated
                ? 'Head to your feed or open the directory to keep exploring.'
                : 'Create an account to follow groups, RSVP to events, and join the conversation.'
            }
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => navigate(isAuthenticated ? '/feed' : '/register')}
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-hover"
            >
              {isAuthenticated ? 'Go to feed' : 'Create account'}
            </button>
            <button
              type="button"
              onClick={() => navigate(isAuthenticated ? '/communities' : '/login')}
              className="rounded-full border border-white/25 px-8 py-3.5 text-sm font-semibold text-white transition hover:border-white/45 hover:bg-white/5"
            >
              {isAuthenticated ? 'All communities' : 'Log in'}
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

export default FinalCTA
