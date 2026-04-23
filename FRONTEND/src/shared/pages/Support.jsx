import { useState } from 'react'
import { BookOpen, ChevronDown, LifeBuoy, Loader2, MessageSquareText, Shield } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import apiClient from '../services/apiClient'

const faqItems = [
  {
    question: 'Who can use HCKonnect?',
    answer: 'Users with a valid Herald College email can register and use the platform.',
  },
  {
    question: 'How do I join a community?',
    answer: 'Browse communities, apply where needed, and wait for approval from the community team.',
  },
  {
    question: 'How can I register for an event?',
    answer: 'Open the event details page and click register to join.',
  },
  {
    question: 'How soon does support respond?',
    answer: 'We usually respond within 24-48 hours on working days.',
  },
]

const initialForm = {
  full_name: '',
  email: '',
  subject: '',
  message: '',
}

export default function Support() {
  const [activeFaq, setActiveFaq] = useState(0)
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [serverMessage, setServerMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setServerMessage('')
    setErrorMessage('')

    try {
      const response = await apiClient.post('/accounts/contact-us/', form)
      setServerMessage(response.data?.message || 'Your message has been sent successfully.')
      setForm(initialForm)
    } catch (error) {
      const apiError =
        error?.response?.data?.detail ||
        Object.values(error?.response?.data || {})?.[0]?.[0] ||
        'Failed to send your message. Please try again.'
      setErrorMessage(apiError)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary text-surface-dark">
      <Navbar navSolid={true} />

      <main className="pt-24 pb-16">
        <div className="mx-auto w-full max-w-6xl px-4">
          <section className="rounded-2xl border border-surface-border bg-white p-6 md:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Support Center</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Help, Guidelines, and Contact</h1>
            <p className="mt-2 text-surface-muted max-w-3xl">
              Everything related to support is available in one place. Use the section links to jump quickly.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <a href="#help-center" className="rounded-lg border border-surface-border px-3 py-1.5 hover:bg-zinc-50">Help Center</a>
              <a href="#community-guidelines" className="rounded-lg border border-surface-border px-3 py-1.5 hover:bg-zinc-50">Guidelines</a>
              <a href="#faq" className="rounded-lg border border-surface-border px-3 py-1.5 hover:bg-zinc-50">FAQ</a>
              <a href="#contact-support" className="rounded-lg border border-surface-border px-3 py-1.5 hover:bg-zinc-50">Contact Support</a>
            </div>
          </section>

          <section id="help-center" className="scroll-mt-28 mt-8 rounded-2xl border border-surface-border bg-white p-6 md:p-8">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">Help Center</h2>
            </div>
            <p className="mt-3 text-surface-muted">
              For account access issues, profile updates, community permissions, or content problems, check these quick paths:
            </p>
            <ul className="mt-4 space-y-2 text-sm text-surface-body list-disc pl-5">
              <li>Login or password issues: use Forgot Password from the login page.</li>
              <li>Profile updates: open your profile and click Edit Profile.</li>
              <li>Community queries: contact the respective community manager.</li>
              <li>Platform bug reports: submit details in Contact Support below.</li>
            </ul>
          </section>

          <section id="community-guidelines" className="scroll-mt-28 mt-6 rounded-2xl border border-surface-border bg-white p-6 md:p-8">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">Community Guidelines</h2>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-surface-body list-disc pl-5">
              <li>Be respectful and professional in discussions and comments.</li>
              <li>Do not post harmful, abusive, discriminatory, or misleading content.</li>
              <li>Use accurate details while creating events, announcements, and posts.</li>
              <li>Respect privacy and avoid sharing private data without consent.</li>
            </ul>
          </section>

          <section id="faq" className="scroll-mt-28 mt-6 rounded-2xl border border-surface-border bg-white p-6 md:p-8">
            <div className="flex items-center gap-2">
              <LifeBuoy size={18} className="text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">Frequently Asked Questions</h2>
            </div>
            <div className="mt-4 space-y-3">
              {faqItems.map((faq, index) => {
                const isOpen = activeFaq === index
                return (
                  <div key={faq.question} className="rounded-xl border border-surface-border overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setActiveFaq(isOpen ? -1 : index)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-zinc-50"
                    >
                      <span className="text-sm sm:text-base font-semibold">{faq.question}</span>
                      <ChevronDown
                        size={18}
                        className={`transition-transform ${isOpen ? 'rotate-180 text-primary' : 'text-surface-muted'}`}
                      />
                    </button>
                    {isOpen && <p className="px-4 pb-4 text-sm text-surface-muted">{faq.answer}</p>}
                  </div>
                )
              })}
            </div>
          </section>

          <section id="contact-support" className="scroll-mt-28 mt-6 rounded-2xl border border-surface-border bg-white p-6 md:p-8">
            <div className="flex items-center gap-2">
              <MessageSquareText size={18} className="text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">Contact Support</h2>
            </div>
            <p className="mt-2 text-sm text-surface-muted">Send your message and our team will reach out by email.</p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  value={form.full_name}
                  onChange={handleChange}
                  className="input-standard w-full"
                  placeholder="Full Name"
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="input-standard w-full"
                  placeholder="Email Address"
                />
              </div>
              <input
                id="subject"
                name="subject"
                type="text"
                required
                value={form.subject}
                onChange={handleChange}
                className="input-standard w-full"
                placeholder="Subject"
              />
              <textarea
                id="message"
                name="message"
                rows={6}
                required
                value={form.message}
                onChange={handleChange}
                className="input-standard w-full resize-none"
                placeholder="Describe your issue or feedback..."
              />

              {serverMessage && (
                <p className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 text-sm">
                  {serverMessage}
                </p>
              )}
              {errorMessage && (
                <p className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-primary-hover disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? 'Sending...' : 'Submit Message'}
              </button>
            </form>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
