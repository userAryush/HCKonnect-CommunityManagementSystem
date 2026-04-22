import { useNavigate } from 'react-router-dom'

function HeroSection() {

const navigate = useNavigate()
const isAuthenticated = Boolean(localStorage.getItem('access_token'))

  return (
    <section id="home"
      className="relative overflow-hidden bg-gradient-to-b from-[#07120b] via-[#0d1f14] to-[#102a1a] text-white pt-32 pb-24"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-[#75C043]/20 blur-[120px]" />
        <div className="absolute right-0 top-10 h-64 w-64 rounded-full bg-[#FFF8DE]/10 blur-[120px]" />
      </div>
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-12 px-4 lg:flex-row lg:px-6">
        <div className="relative z-10 flex-1 text-center lg:text-left">
          <p className="inline-flex items-center rounded-full border border-white/20 px-4 py-2 text-sm uppercase tracking-wide text-white/80">
            Herald Communities, united
          </p>
          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            HCKonnect: One Platform. Every Community.
          </h1>
          <p className="mt-6 text-lg text-white/80">
            Launch, grow, and energize every student group with centralized conversations, events, and
            resources—inside a modern, distraction-free home.
          </p>
          <div className="mt-8 flex flex-col gap-4 text-base font-semibold sm:flex-row sm:justify-center lg:justify-start">

          <button onClick={() => navigate(isAuthenticated ? '/feed' : '/register')}
            className="rounded-full bg-[#75C043] px-8 py-3 text-[#0f1a12] shadow-2xl shadow-[#75C043]/40 transition hover:-translate-y-0.5 hover:scale-105">
            Join Now
          </button>

            <button onClick={() => navigate(isAuthenticated ? '/communities' : '/login')}
            className="rounded-full border border-white/40 px-8 py-3 text-white transition hover:border-white">
              Explore Communities
            </button>
          </div>
        </div>

        <div className="relative z-10 flex-1">
          <div className="relative mx-auto h-96 w-96 max-w-full rounded-[2.5rem] bg-[#0b1a11]/80 p-10 text-white shadow-2xl ring-1 ring-white/10">
            <div className="flex items-center justify-between text-sm text-white/60">
              <span>Activities</span>
              <span>24 this week</span>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 text-center">
              {['👥 Communities', '📅 Events', '💬 Discussions', '👥Engagement'].map((label) => (
                <div key={label} className="rounded-2xl bg-white/5 px-4 py-6">
                  {/* <p className="text-3xl">•</p> */}
                  <p className="mt-3 text-sm text-white/70">{label}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection

