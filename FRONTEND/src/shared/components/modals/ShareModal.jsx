import { useEffect, useState } from 'react'
import { Link2 } from 'lucide-react'
import { useToast } from '../ui/ToastContext'
import ModalWrapper from './ModalWrapper'
import ModalHeader from './ModalHeader'
import { getShareLinks } from '../../../utils/shareUtils'

const MessengerLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path
      fill="#0084FF"
      d="M12 2C6.48 2 2 6.15 2 11.28c0 2.92 1.47 5.53 3.77 7.23V22l3.34-1.83c.89.24 1.84.38 2.89.38 5.52 0 10-4.15 10-9.27S17.52 2 12 2Z"
    />
    <path fill="#fff" d="m6.68 13.97 3.5-3.72 1.83 1.84 3.31-1.84-3.5 3.72-1.83-1.84-3.31 1.84Z" />
  </svg>
)

const DiscordLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path
      fill="#5865F2"
      d="M20.32 4.37A19.79 19.79 0 0 0 15.5 3l-.23.47a18.2 18.2 0 0 1 4.3 1.3c-3.98-1.81-8.26-1.81-12.14 0a18.2 18.2 0 0 1 4.3-1.3L11.5 3a19.79 19.79 0 0 0-4.82 1.37C3.7 8.78 2.9 13.08 3.3 17.32A19.7 19.7 0 0 0 9 20.2l1.22-1.63c-.66-.23-1.3-.53-1.9-.89.16.12.33.23.5.33 3.13 1.53 6.53 1.53 9.66 0 .17-.1.34-.21.5-.33-.6.36-1.24.66-1.9.89L18.3 20.2a19.7 19.7 0 0 0 5.7-2.88c.47-4.91-.8-9.17-3.68-12.95ZM9.82 14.73c-.95 0-1.73-.88-1.73-1.95 0-1.08.77-1.95 1.73-1.95s1.74.88 1.73 1.95c0 1.08-.77 1.95-1.73 1.95Zm4.36 0c-.95 0-1.73-.88-1.73-1.95 0-1.08.77-1.95 1.73-1.95s1.74.88 1.73 1.95c0 1.08-.77 1.95-1.73 1.95Z"
    />
  </svg>
)

const WhatsAppLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path
      fill="#25D366"
      d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.9.54 3.72 1.56 5.3L2 22l5-1.7a9.79 9.79 0 0 0 5.04 1.38c5.44 0 9.84-4.4 9.84-9.84S17.48 2 12.04 2Zm5.73 13.9c-.24.68-1.38 1.24-1.9 1.32-.5.08-1.12.12-3.62-.91-3.02-1.24-4.95-4.3-5.1-4.5-.15-.2-1.23-1.64-1.23-3.12 0-1.47.78-2.2 1.06-2.5.27-.3.6-.37.8-.37.2 0 .4 0 .58.01.18 0 .42-.07.66.5.24.57.8 1.98.87 2.13.07.15.12.33.02.54-.1.2-.15.33-.3.5-.15.18-.32.4-.46.53-.15.15-.3.32-.13.62.18.3.78 1.3 1.68 2.1 1.15 1 2.12 1.3 2.42 1.45.3.15.47.13.64-.08.18-.2.75-.88.95-1.18.2-.3.4-.24.67-.14.27.1 1.72.8 2.02.95.3.15.5.22.57.35.07.13.07.76-.17 1.44Z"
    />
  </svg>
)

const GmailLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path fill="#EA4335" d="M22 6.2v11.6c0 .66-.54 1.2-1.2 1.2H19V9.1l-7 5.26L5 9.1V19H3.2c-.66 0-1.2-.54-1.2-1.2V6.2L12 13.5 22 6.2Z" />
    <path fill="#FBBC04" d="M22 6.2 19 9.1V19h1.8c.66 0 1.2-.54 1.2-1.2V6.2Z" />
    <path fill="#34A853" d="M2 6.2V17.8c0 .66.54 1.2 1.2 1.2H5V9.1L2 6.2Z" />
    <path fill="#4285F4" d="M22 6.2v.02L12 13.5 2 6.22V6.2C2 5.54 2.54 5 3.2 5h17.6c.66 0 1.2.54 1.2 1.2Z" />
  </svg>
)

const shareOptions = [
  { key: 'messenger', label: 'Messenger', Logo: MessengerLogo },
  { key: 'discord', label: 'Discord', Logo: DiscordLogo },
  { key: 'whatsapp', label: 'WhatsApp', Logo: WhatsAppLogo },
  { key: 'gmail', label: 'Gmail', Logo: GmailLogo },
]

export default function ShareModal({
  isOpen,
  onClose,
  title = 'Share this',
  text = 'Check this out!',
  url,
}) {
  const { showToast } = useToast()
  const [isCopied, setIsCopied] = useState(false)
  const [platformHint, setPlatformHint] = useState('')
  const shareLinks = getShareLinks({ title, text, url })

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    setIsCopied(false)
    setPlatformHint('')
  }, [isOpen, url])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setIsCopied(true)
      showToast('Link copied to clipboard!', 'success')
      setTimeout(() => setIsCopied(false), 1800)
    } catch (error) {
      showToast('Unable to copy link. Please copy manually.', 'error')
    }
  }

  const handleOptionClick = async (key) => {
    if (key === 'discord') {
      await handleCopyLink()
      setPlatformHint(`Link copied - paste it in Discord.`)
      showToast(`Link copied - paste it in Discord.`, 'success')
      setTimeout(() => setPlatformHint(''), 2200)
    }

    window.open(shareLinks[key], '_blank', 'noopener,noreferrer')
  }

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} className="max-w-md">
      <ModalHeader title="Share" subtitle="Choose an app or copy the link." onClose={onClose} />
      <div role="dialog" aria-modal="true" className="px-5 pb-5">
        <section className="pt-4">
          <p className="mb-3 text-sm font-semibold text-surface-dark">Share via</p>
          <div className="grid grid-cols-4 gap-3">
            {shareOptions.map(({ key, label, Logo }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleOptionClick(key)}
                className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-surface-border px-4 py-4 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
                aria-label={`Share via ${label}`}
              >
                <Logo />
                <span className="text-xs font-medium text-surface-body group-hover:text-surface-dark">
                  {label}
                </span>
              </button>
            ))}
          </div>
          {platformHint && (
            <p className="mt-3 text-xs font-medium text-surface-muted">
              {platformHint}
            </p>
          )}
        </section>

        <section className="mt-5">
          <p className="mb-2 text-sm font-semibold text-surface-dark">Or copy link</p>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-muted" />
              <input
                type="text"
                value={url}
                readOnly
                className="w-full rounded-xl border border-surface-border bg-zinc-50 py-2 pl-9 pr-3 text-sm text-surface-body outline-none"
                aria-label="Share link"
              />
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors min-w-[78px]"
            >
              {isCopied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </section>
      </div>
    </ModalWrapper>
  )
}
