import { Users, CalendarDays, MessageSquare, BookOpen, Zap, BarChart3 } from 'lucide-react'
import SectionHeading from './SectionHeading'
import Reveal from './Reveal'
import sectionBgImage from '../../../assets/bg3.jpg'

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
    <section id="platform" className="relative isolate overflow-hidden px-5 py-20 text-white sm:px-8">
      <div className="absolute inset-0 z-0" aria-hidden>
        <img
          src={sectionBgImage}
          alt=""
          className="h-full w-full object-cover"
          decoding="async"
        />
        <div className="absolute inset-0 bg-primary/90" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <Reveal>
          <SectionHeading
            theme="dark"
            accent="platform"
            label="Platform Features"
            description="From first join to active contribution, the platform is designed to keep momentum high and friction low."
          />
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon
            return (
              <Reveal key={pillar.title} delay={0.06 + i * 0.07}>
                <article className="flex h-full flex-col rounded-2xl border border-surface-border/80 bg-white p-6 shadow-md shadow-black/5 transition hover:border-primary/30 hover:shadow-lg">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-semibold text-surface-dark">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-surface-body">{pillar.desc}</p>
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
                <article className="flex h-full gap-4 rounded-2xl border border-surface-border/80 bg-white p-5 shadow-md shadow-black/5 transition hover:border-primary/30 hover:shadow-lg">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-display text-sm font-semibold text-surface-dark">{mod.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-surface-body">{mod.desc}</p>
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
