import { useNavigate } from 'react-router-dom'
import SectionHeading from './SectionHeading'
import Reveal from './Reveal'
import sectionBgImage from '../../../assets/bg3.jpg'

function FinalCTA() {
  const navigate = useNavigate()
  const isAuthenticated = Boolean(localStorage.getItem('access_token'))

  return (
    <section className="relative isolate overflow-hidden px-5 py-16 text-white sm:px-8 sm:py-20">
      <div className="absolute inset-0 z-0" aria-hidden>
        <img
          src={sectionBgImage}
          alt=""
          className="h-full w-full object-cover"
          decoding="async"
        />
        <div className="absolute inset-0 bg-primary/90" />
      </div>

      <Reveal>
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center gap-8 text-center sm:p-10 lg:p-12">
          <SectionHeading
            theme="dark"
            accent="cta"
            label="Start Today"
            description={
              isAuthenticated
                ? 'Head to your feed or open the directory to keep exploring.'
                : 'Create an account to join communities, RSVP to events, and join the conversation.'
            }
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => navigate(isAuthenticated ? '/feed' : '/register')}
              className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-primary shadow-lg shadow-black/10 transition hover:bg-white/90"
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
