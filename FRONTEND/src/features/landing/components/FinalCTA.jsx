import { useNavigate } from 'react-router-dom'
function FinalCTA() {

  const navigate = useNavigate()
  const isAuthenticated = Boolean(localStorage.getItem('access_token'))
  return (
    <section className="bg-[#0d1f14] px-4 py-20 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 rounded-[3rem] bg-gradient-to-r from-[#75C043] to-[#93e05a] p-12 text-center text-[#0f1a12] shadow-2xl shadow-[#75C043]/40 lg:flex-row lg:text-left">
        <div className="flex-1">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0f1a12]/70">
            Ready for lift-off
          </p>
          <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
            Join your community. Stay connected. Explore more.
          </h2>
          <p className="mt-4 text-[#0f1a12]/80">
            Give every student a single source of truth for belonging, impact, and action.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-sm font-semibold lg:flex-row">
          <button onClick={() => navigate(isAuthenticated ? '/feed' : '/register')}
            className="rounded-full bg-[#0f1a12] px-8 py-3 text-white transition hover:scale-105">
            Create Account
          </button>
          <button onClick={() => navigate(isAuthenticated ? '/feed' : '/login')}
            className="rounded-full border border-[#0f1a12] px-8 py-3 text-[#0f1a12] transition hover:bg-[#0f1a12]/10">
            Login
          </button>
        </div>
      </div>
    </section>
  )
}

export default FinalCTA

