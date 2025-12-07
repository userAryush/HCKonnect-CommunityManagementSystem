const steps = [
    { title: 'Explore Communities', desc: 'Browse communities, see upcoming events and announcements.', icon: '👀' },
    { title: 'Join a Community', desc: 'Sign up to participate, post, and get updates from your favorite communities.', icon: '🤝' },
    { title: 'Stay Updated', desc: 'Receive notifications on new posts, events, and resources.', icon: '🔔' },
]


function HowItWorksSection() {
    return (
        <section id="how-it-works" className="bg-white px-4 py-20">
            <div className="mx-auto w-full max-w-6xl">
                <header className="text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#75C043]">How it works</p>
                    <h2 className="mt-3 text-3xl font-semibold text-[#0d1f14] sm:text-4xl">
                        Simple onboarding, lasting engagement.
                    </h2>
                </header>
                <div className="mt-12 grid gap-6 md:grid-cols-3">
                    {steps.map((step, index) => (
                        <article
                            key={step.title}
                            className="rounded-3xl border border-[#e5e7eb] bg-white p-6 text-center shadow-lg shadow-[#000]/5 transition hover:-translate-y-1 hover:border-[#75C043]/50"
                        >
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#75C043]/10 text-2xl">
                                {step.icon}
                            </div>
                            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#c4c4c4]">0{index + 1}</p>
                            <h3 className="mt-2 text-xl font-semibold text-[#0d1f14]">{step.title}</h3>
                            <p className="mt-2 text-sm text-[#4b4b4b]">{step.desc}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default HowItWorksSection

