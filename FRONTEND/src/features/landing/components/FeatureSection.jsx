import { Users, CalendarDays, MessageSquare, BookOpen, Zap, BarChart3 } from 'lucide-react'
import SectionHeading from './SectionHeading'
import Reveal from './Reveal'

const pillars = [
  {
    title: 'Community home',
    desc: 'A dedicated profile and feed per group—branding, roles, and membership in one place.',
    icon: Users,
  },
  {
    title: 'Events that convert',
    desc: 'Listings, RSVPs, and reminders so turnout stays high without extra spreadsheets.',
    icon: CalendarDays,
  },
  {
    title: 'Structured discussions',
    desc: 'Panels and threads stay searchable instead of buried in chat history.',
    icon: MessageSquare,
  },
]

const modules = [
  { title: 'Resource hub', desc: 'Slides, links, and files students actually reopen.', icon: BookOpen },
  { title: 'Timely nudges', desc: 'Notifications tied to real activity—not noise.', icon: Zap },
  { title: 'Leadership view', desc: 'Glanceable health for reps and faculty sponsors.', icon: BarChart3 },
]

function FeatureSection() {
  return (
    <section id="platform" className="relative overflow-hidden bg-surface-dark px-5 py-20 text-white sm:px-8">
      <div className="pointer-events-none absolute -right-24 top-0 h-96 w-96 rounded-full bg-primary/25 blur-[100px]" />
      <div className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-primary/15 blur-[90px]" />

      <div className="relative mx-auto w-full max-w-6xl">
        <Reveal>
          <SectionHeading
            theme="dark"
            label="Platform power"
            title="Built for operators, comfortable for every member."
            description="From first join to active contribution, the platform is designed to keep momentum high and friction low."
          />
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon
            return (
              <Reveal key={pillar.title} delay={0.06 + i * 0.07}>
                <article className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-xl shadow-black/20 backdrop-blur-sm transition hover:border-primary/40 hover:bg-white/[0.09]">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20 text-primary">
                    <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-semibold text-white">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{pillar.desc}</p>
                </article>
              </Reveal>
            )
          })}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {modules.map((mod, i) => {
            const Icon = mod.icon
            return (
              <Reveal key={mod.title} delay={0.05 + i * 0.05}>
                <article className="flex h-full gap-4 rounded-2xl border border-white/5 bg-black/20 p-5 transition hover:border-white/15">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/90">
                    <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-display text-sm font-semibold text-white">{mod.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-white/65">{mod.desc}</p>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default FeatureSection
