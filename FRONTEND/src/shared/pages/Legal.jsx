import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

export default function Legal() {
  return (
    <div className="min-h-screen bg-secondary text-surface-dark">
      <Navbar navSolid={true} />

      <main className="pt-24 pb-16">
        <div className="mx-auto w-full max-w-6xl px-4">
          <section className="rounded-2xl border border-surface-border bg-white p-6 md:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Legal Center</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Privacy and Terms</h1>
            <p className="mt-2 text-surface-muted max-w-3xl">
              Legal information is grouped on this page for quick access.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <a href="#privacy-policy" className="rounded-lg border border-surface-border px-3 py-1.5 hover:bg-zinc-50">Privacy Policy</a>
              <a href="#terms-of-service" className="rounded-lg border border-surface-border px-3 py-1.5 hover:bg-zinc-50">Terms of Service</a>
            </div>
          </section>

          <section id="privacy-policy" className="scroll-mt-28 mt-8 rounded-2xl border border-surface-border bg-white p-6 md:p-8">
            <h2 className="text-2xl font-bold tracking-tight">Privacy Policy</h2>
            <div className="mt-4 space-y-3 text-sm text-surface-body leading-relaxed">
              <p>
                We collect account details (such as name and institutional email), profile information, and activity data to provide and improve HCKonnect services.
              </p>
              <p>
                Your data is used for authentication, platform features, moderation, and service reliability. We do not sell your personal information.
              </p>
              <p>
                You can request account updates or deletion through support channels, subject to applicable institutional or legal requirements.
              </p>
            </div>
          </section>

          <section id="terms-of-service" className="scroll-mt-28 mt-6 rounded-2xl border border-surface-border bg-white p-6 md:p-8">
            <h2 className="text-2xl font-bold tracking-tight">Terms of Service</h2>
            <div className="mt-4 space-y-3 text-sm text-surface-body leading-relaxed">
              <p>
                By using HCKonnect, you agree to follow platform rules, community standards, and all applicable institutional policies.
              </p>
              <p>
                Users are responsible for content they publish. Harmful, abusive, deceptive, or unauthorized activity may lead to content removal or account restrictions.
              </p>
              <p>
                We may update these terms as the platform evolves. Continued use of the platform indicates acceptance of revised terms.
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
