import SectionHeading from './SectionHeading'
import Reveal from './Reveal'

const testimonials = [
  {
    name: 'Maya I.',
    role: 'Community lead · Tech club',
    quote: 'We retired a patchwork of chats and forms. HCKonnect is the one link we share at fairs now.',
  },
  {
    name: 'Ravi S.',
    role: 'Student council',
    quote: 'Announcements and RSVPs finally live together—fewer “did you see the doc?” moments.',
  },
  {
    name: 'Elena V.',
    role: 'Events coordinator',
    quote: 'Post-event feedback sits next to the event itself. Reporting back to faculty is painless.',
  },
]

function TestimonialsSection() {
  return (
    <section id="voices" className="bg-secondary px-5 py-20 sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <SectionHeading
            accent="testimonials"
            label="Voices from College"
            description="Community leads and coordinators share how HCKonnect keeps their groups organized and students in the loop."
          />
        </Reveal>

        <div className="mt-14 columns-1 gap-5 md:columns-2 lg:columns-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} className="mb-5 break-inside-avoid" delay={0.06 + i * 0.07}>
              <figure className="rounded-2xl border border-surface-border/80 bg-white p-6 shadow-sm">
                <blockquote>
                  <p className="text-[15px] leading-relaxed text-surface-dark/90">
                    “{t.quote}”
                  </p>
                </blockquote>
                <figcaption className="mt-5 border-t border-surface-border/60 pt-4">
                  <p className="text-sm font-semibold text-surface-dark">{t.name}</p>
                  <p className="mt-0.5 text-xs text-surface-body">{t.role}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
