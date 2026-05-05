import { Compass, UserPlus, Sparkles } from 'lucide-react'
import SectionHeading from './SectionHeading'
import Reveal from './Reveal'

const steps = [
  {
    title: 'Discover',
    desc: 'Browse the showcase, read blurbs, and jump into profiles that match your interests.',
    icon: Compass,
  },
  {
    title: 'Join',
    desc: 'Create an account (or sign in) and follow the communities you care about.',
    icon: UserPlus,
  },
  {
    title: 'Engage',
    desc: 'RSVP to events, join discussions, and catch announcements in one steady stream.',
    icon: Sparkles,
  },
]

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-y border-surface-border bg-white px-5 py-20 sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <SectionHeading label="How it works" title="From curious visitor to active member." />
        </Reveal>

        <Reveal className="relative mx-auto mt-16 max-w-4xl" delay={0.08}>
          <div
            className="absolute left-[1.35rem] top-4 bottom-4 hidden w-px bg-gradient-to-b from-primary/0 via-primary/40 to-primary/0 md:block"
            aria-hidden
          />
          <ol className="flex flex-col gap-10 md:gap-0">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <Reveal
                  key={step.title}
                  as="li"
                  className="relative flex gap-5 md:grid md:grid-cols-[4rem_1fr] md:gap-8 md:py-8"
                  delay={0.06 + index * 0.08}
                >
                  <div className="flex flex-shrink-0 md:justify-end">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-surface-border bg-[#f3f7ef] text-primary shadow-sm md:relative md:z-10">
                      <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                    </span>
                  </div>
                  <div className="min-w-0 pt-0.5 md:rounded-2xl md:border md:border-surface-border/90 md:bg-[#fafbf8] md:p-6 md:shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-muted">
                      Step {String(index + 1).padStart(2, '0')}
                    </p>
                    <h3 className="mt-1 font-display text-xl font-semibold text-surface-dark">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-surface-body">{step.desc}</p>
                  </div>
                </Reveal>
              )
            })}
          </ol>
        </Reveal>
      </div>
    </section>
  )
}

export default HowItWorksSection
