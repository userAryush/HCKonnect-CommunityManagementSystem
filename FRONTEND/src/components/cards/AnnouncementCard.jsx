import { Trash2 } from 'lucide-react'
import { formatTimeAgo } from '../../utils/timeFormatter'
import { getInitials, getDisplayName, getRoleLabel, getProfileImage } from '../../utils/userUtils'
import announcementService from '../../services/announcementService'
import Card from '../shared/Card'
import Badge from '../shared/Badge'

export default function AnnouncementCard({ item, onDelete }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const canDelete = user && (
    (user.role === 'community' && String(user.id) === String(item.community?.id)) ||
    (user.membership && user.membership.role === 'representative' && String(user.membership.community) === String(item.community?.id)) ||
    (String(user.id) === String(item.author?.id || item.author))
  );

  const handleDelete = async () => {
    if (window.confirm("Delete this announcement?")) {
      try {
        await announcementService.deleteAnnouncement(item.id);
        if (onDelete) onDelete(item.id);
        else window.location.reload();
      } catch (error) {
        console.error("Failed to delete", error);
      }
    }
  }

  return (
    <Card className="group relative">
      <div className="flex items-center justify-between mb-4">
        <header className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 font-bold overflow-hidden border border-zinc-200 uppercase text-xs tracking-wider"
            aria-hidden
          >
            {getProfileImage(item) ? (
              <img src={getProfileImage(item)} alt={getDisplayName(item)} className="h-full w-full object-cover" />
            ) : (
              getInitials(getDisplayName(item))
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-surface-dark">{getDisplayName(item)}</p>
            <p className="text-metadata cursor-default">
              {getRoleLabel(item)} • {formatTimeAgo(item.createdAt || item.created_at)}
            </p>
          </div>
        </header>

        <div className="flex items-center gap-2">
          <Badge variant="gray">Announcement</Badge>
          {item.visibility && (
            <Badge variant={item.visibility === 'public' ? 'success' : 'gray'}>
              {item.visibility}
            </Badge>
          )}

          {canDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(); }}
              className="text-zinc-400 hover:text-red-500 p-1.5 transition-colors rounded-full hover:bg-red-50"
              title="Delete Announcement"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-title group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        <p className="text-body leading-relaxed">
          {item.description}
        </p>
      </div>
    </Card>
  )
}
