function Footer() {
  const navLinks = ['Home', 'Communities', 'Events', 'About', 'Contact']

  return (
    <footer className="bg-[#050a05] px-4 py-12 text-white">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold">HCKonnect</p>
            <p className="text-xs uppercase tracking-[0.5em] text-white/50">Herald Community Konnect</p>
            <p className="mt-3 text-sm text-white/60">Centralizing college connection since day one.</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm font-semibold text-white/70">
            {navLinks.map((link) => (
              <a key={link} href={`#${link.toLowerCase()}`} className="hover:text-white">
                {link}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3 text-sm font-semibold text-white/70">
            {['IG', 'IN', 'YT'].map((social) => (
              <span
                key={social}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 hover:border-[#75C043]"
              >
                {social}
              </span>
            ))}
          </div>
        </div>
        <p className="mt-10 text-center text-xs text-white/50">© {new Date().getFullYear()} HCKonnect. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer

