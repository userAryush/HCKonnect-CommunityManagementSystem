const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Communities', href: '#communities' },
  { label: 'Events', href: '#events' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]



function Navbar({ menuOpen = false, toggleMenu = () => { }, closeMenu = () => { }, navSolid = false, rightActions = null }) {
  const baseStyles =
    'fixed inset-x-0 top-0 z-50 border-b border-white/10 backdrop-blur-lg transition-colors duration-300'
  const transparent = 'bg-transparent text-white'
  const solid = 'bg-[#0d1f14]/95 text-white shadow-xl'

  return (
    <header className={`${baseStyles} ${navSolid ? solid : transparent}`}>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 lg:px-6">
        <a
          href="#home"
          onClick={closeMenu}
          className="flex flex-col items-start gap-1"
        >
          <div className="flex items-center gap-2">
            <img
              src="/favicon.png" 
              alt="HCKonnect logo"
              className="h-8 w-8 rounded-full"
            />
            <span className="text-lg font-semibold tracking-wide">
              HCKonnect
            </span>
          </div>
          <span className="text-xs uppercase text-white/70">
            Herald Community Konnect
          </span>
        </a>


        <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-white/80 transition hover:text-white"
              onClick={closeMenu}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {rightActions}
          <button className="rounded-full border border-white/40 px-5 py-2 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10">
            Login
          </button>
          <button className="rounded-full bg-[#75C043] px-5 py-2 text-sm font-semibold text-[#0f1a12] shadow-lg shadow-[#75C043]/40 transition hover:scale-105">
            Get Started
          </button>
        </div>

        <button
          className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/30 lg:hidden"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span
            className={`absolute h-0.5 w-6 bg-white transition-all ${menuOpen ? 'translate-y-0 rotate-45' : '-translate-y-2'
              }`}
          />
          <span className={`h-0.5 w-6 bg-white transition ${menuOpen ? 'opacity-0' : 'opacity-100'}`} />
          <span
            className={`absolute h-0.5 w-6 bg-white transition-all ${menuOpen ? 'translate-y-0 -rotate-45' : 'translate-y-2'
              }`}
          />
        </button>
      </div>

      <div
        className={`lg:hidden ${menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'} transition`}
      >
        <div className="mx-4 mt-2 rounded-3xl bg-[#0d1f14]/95 p-6 shadow-2xl ring-1 ring-white/10">
          <nav className="flex flex-col gap-4 text-base font-semibold text-white/90">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} onClick={closeMenu} className="hover:text-white">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-6 flex flex-col gap-3">
            <button className="rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              Login
            </button>
            <button className="rounded-full bg-[#75C043] px-5 py-3 text-sm font-semibold text-[#0f1a12] shadow-lg shadow-[#75C043]/40 transition hover:scale-105">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar

