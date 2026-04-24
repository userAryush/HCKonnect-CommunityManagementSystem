export const getShareUrl = (rawUrl) => {
  if (!rawUrl && typeof window !== 'undefined') {
    return window.location.href
  }

  if (!rawUrl) {
    return ''
  }

  try {
    return new URL(rawUrl, window.location.origin).toString()
  } catch (error) {
    return rawUrl
  }
}

export const getContentShareUrl = (type, id) => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const resolvedType = type === 'discussion' ? 'discussions' : 'posts'
  return `${baseUrl}/${resolvedType}/${id}`
}

export const getShareLinks = ({ title, text, url }) => {
  const encodedUrl = encodeURIComponent(url)
  const encodedText = encodeURIComponent(`${text} ${url}`.trim())
  const encodedSubject = encodeURIComponent(title || 'Shared from HCKonnect')
  const encodedBody = encodeURIComponent(`${text}\n\n${url}`.trim())

  return {
    messenger: `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=1629989438253177&redirect_uri=${encodedUrl}`,
    discord: 'https://discord.com/channels/@me',
    whatsapp: `https://wa.me/?text=${encodedText}`,
    gmail: `https://mail.google.com/mail/?view=cm&fs=1&su=${encodedSubject}&body=${encodedBody}`,
  }
}
