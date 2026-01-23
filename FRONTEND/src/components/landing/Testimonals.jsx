const testimonials = [
  {
    name: 'Maya I.',
    role: 'Community Lead, Tech Club',
    quote: 'We replaced six apps with HCKonnect. Engagement doubled in one semester.',
  },
  {
    name: 'Ravi S.',
    role: 'Student Council President',
    quote: 'Communication feels effortless—events fill up faster and everyone stays informed.',
  },
  {
    name: 'Elena V.',
    role: 'Events Club Coordinator',
    quote: 'From RSVPs to post-event feedback, everything runs smoother on one dashboard.',
  },
]

function TestimonialsSection() {
  return (
    <section id="contact" className="bg-white px-4 py-20">
      <div className="mx-auto w-full max-w-6xl">
        <header className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#75C043]">Trusted voices</p>
          <h2 className="mt-4 text-3xl font-semibold text-[#0d1f14] sm:text-4xl">
            Communities thrive when everything is in one place.
          </h2>
        </header>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.name}
              className="rounded-3xl border border-[#e5e7eb] bg-[#fdfdfc] p-6 text-left shadow-lg shadow-black/5"
            >
              <p className="text-lg italic text-[#0d1f14]/80">“{testimonial.quote}”</p>
              <div className="mt-6">
                <p className="text-base font-semibold text-[#0d1f14]">{testimonial.name}</p>
                <p className="text-sm text-[#4b4b4b]">{testimonial.role}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection


