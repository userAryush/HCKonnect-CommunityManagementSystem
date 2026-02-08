import CommunityAvatar from '../shared/CommunityAvatar'
import { Trash2 } from 'lucide-react'
import announcementService from '../../services/announcementService'

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function AnnouncementCard({ item, onDelete }) {
  // Determine if user can delete
  // Determine if user can delete
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // Debugging
  if (user && item) {
    console.log(`Announcement ${item.id} - User: ${user.id} (${user.role}), Community: ${item.community.id}, Author: ${item.author.id || item.author}`);
  }

  const canDelete = user && (
    // Community Admin check
    (user.role === 'community' && String(user.id) === String(item.community.id)) ||
    // Representative check
    (user.membership && user.membership.role === 'representative' && String(user.membership.community) === String(item.community.id)) ||
    // Author check (handling both object and ID)
    (String(user.id) === String(item.author.id || item.author))
  );

  const handleDelete = async () => {
    if (window.confirm("Delete this announcement?")) {
      try {
        await announcementService.deleteAnnouncement(item.id);
        if (onDelete) onDelete(item.id);
        else window.location.reload();
      } catch (error) {
        console.error("Failed to delete", error);
        alert("Failed to delete announcement");
      }
    }
  }

  return (
    <article className="relative overflow-hidden rounded-3xl border border-[#e5e7eb] bg-[#fffcf5] p-5 shadow-sm transition hover:shadow-md">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#c08619]" />
      <div className="flex items-start gap-3">
        <CommunityAvatar name={item.community.name} logoText={item.community.logoText} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#0d1f14]">{item.community.name}</p>
              <p className="text-xs text-[#4b4b4b]">
                {item.author.name} • {timeAgo(item.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${item.visibility === 'public'
                ? 'bg-green-100 text-green-700 border-green-200'
                : 'bg-gray-100 text-gray-600 border-gray-200'
                }`}>
                {item.visibility || 'Public'}
              </span>

              {canDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                  className="text-red-400 hover:text-red-600 p-1"
                  title="Delete Announcement"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-[#0d1f14]">{item.title}</h3>
          <p className="mt-2 text-sm text-[#4b4b4b]">{item.description}</p>
        </div>
      </div>
    </article>
  )
}
