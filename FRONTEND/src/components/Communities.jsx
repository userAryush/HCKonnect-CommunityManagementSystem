const communities = [
  { title: 'AI Learners', tagline: 'Learn, build, repeat.', logo: '💻' },
  { title: 'UI Visuals', tagline: 'Design your life', logo: '💻' },
  { title: 'Game Dev Community', tagline: 'Build and Play.', logo: '💻' },
  { title: 'Herald Creators Community', tagline: 'Campus experiences, curated.', logo: '💻' },
  { title: 'Herald Bizcore', tagline: 'Campus experiences, curated.', logo: '💻' },
  { title: 'IOT Innovators', tagline: 'Campus experiences, curated.', logo: '💻' },
  { title: 'Ethical HCK', tagline: 'Campus experiences, curated.', logo: '💻' },
]

function CommunityShowcase() {
  return (
    <section id="communities" className="bg-[#f5f8f2] px-4 py-20">
      <div className="mx-auto w-full max-w-6xl">
        <header className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#75C043]">Community showcase</p>
          <h2 className="mt-3 text-3xl font-semibold text-[#0d1f14] sm:text-4xl">
            Built for every type of student-led group.
          </h2>
        </header>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {communities.map((community) => (
            <article
              key={community.title}
              className="flex flex-col justify-between rounded-3xl border border-[#e2e8d8] bg-white/80 p-6 shadow-xl shadow-[#000]/5 transition hover:-translate-y-1"
            >
              <div>
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#75C043]/15 text-2xl">
                  {community.logo}
                </div>
                <h3 className="mt-6 text-2xl font-semibold text-[#0f1f15]">{community.title}</h3>
                <p className="mt-2 text-sm text-[#4b4b4b]">{community.tagline}</p>
              </div>
              <button className="mt-6 w-max rounded-full border border-[#0f1f15]/10 px-5 py-2 text-sm font-semibold text-[#0f1f15] transition hover:border-[#75C043] hover:text-[#75C043]">
                View Community
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CommunityShowcase

