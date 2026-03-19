import { getInitials } from '../../utils/userUtils';

export default function CommunityAvatar({ name, logo, logoText, size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 font-bold text-zinc-500 uppercase tracking-wider overflow-hidden ${sizeClasses[size]} ${className}`}
      aria-label={`${name} logo`}
    >
      {logo ? (
        <img src={logo} alt={name} className="h-full w-full object-cover" />
      ) : (
        logoText || getInitials(name || 'C')
      )}
    </div>
  )
}
