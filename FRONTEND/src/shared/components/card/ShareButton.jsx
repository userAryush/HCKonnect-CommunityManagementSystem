import { useState } from 'react'
import { Share2 } from 'lucide-react'
import Button from '../ui/Button'
import ShareModal from '../modals/ShareModal'
import { getShareUrl } from '../../../utils/shareUtils'

const ShareButton = ({
  title,
  url,
  text = 'Check this out!',
  className = '',
  children,
  onClick,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const shareUrl = getShareUrl(url)

  const openModal = (event) => {
    if (event) event.stopPropagation()
    if (onClick) onClick(event)
    setIsOpen(true)
  }

  return (
    <>
      <Button
        onClick={openModal}
        variant="ghost"
        className={`shrink-0 ${className}`}
        title="Share"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        {...props}
      >
        {children || <Share2 size={16} />}
      </Button>

      <ShareModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        text={text}
        url={shareUrl}
      />
    </>
  )
}

export default ShareButton