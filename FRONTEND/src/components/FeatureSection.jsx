const featureCards = [
  { title: 'Community Spaces', desc: 'Join clubs, view announcements, and connect with peers.', icon: '🌐' },
  { title: 'Events & Meetups', desc: 'See upcoming events, register, and track participation.', icon: '📅' },
  { title: 'Discussion Boards', desc: 'Ask questions, share ideas, and participate in threads.', icon: '💬' },
  { title: 'Resource Library', desc: 'Access notes, slides, and other study materials.', icon: '📚' },
  { title: 'Instant Notifications', desc: 'Get updates when something new happens in your communities.', icon: '⚡' },
  { title: 'Community Insights', desc: 'See how active your community is at a glance.', icon: '📊' },
]


function FeatureSection() {
  return (
    <section id="events" className="bg-[#061007] px-4 py-20 text-white">
      <div className="mx-auto w-full max-w-6xl">
        <header className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#75C043]">Platform power</p>
          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Organize every touchpoint without the chaos.</h2>
          <p className="mt-3 text-white/70">
            Six powerful modules keep community managers, mentors, and members aligned.
          </p>
        </header>
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map((card) => (
            <article
              key={card.title}
              className="rounded-3xl border border-white/5 bg-gradient-to-br from-white/5 to-white/0 p-6 shadow-2xl shadow-black/30 transition hover:-translate-y-1 hover:border-[#75C043]/30 hover:bg-white/10"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF8DE]/20 text-2xl">
                {card.icon}
              </div>
              <h3 className="mt-4 text-xl font-semibold">{card.title}</h3>
              <p className="mt-2 text-sm text-white/70">{card.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeatureSection

