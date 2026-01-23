export default function CommunityAvatar({ name, logoText, size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
  }

  return (
    <div
      className={`flex items-center justify-center rounded-xl bg-[#0d1f14] font-bold text-white shadow-sm ${sizeClasses[size]} ${className}`}
      aria-label={`${name} logo`}
    >
      {logoText}
    </div>
  )
}
