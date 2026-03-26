import { useNavigate } from 'react-router-dom'
import { Edit, Trash2 } from 'lucide-react'
import { formatTimeAgo } from '../../utils/timeFormatter'
import { getInitials, getDisplayName, getRoleLabel, getProfileImage } from '../../utils/userUtils'
import announcementService from '../../services/announcementService'
import Card from '../shared/Card'
import Badge from '../shared/Badge'
import Dropdown from '../shared/Dropdown'

export default function AnnouncementCard({ item, onDelete }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const canDelete = user && (
    (user.role === 'community' && String(user.id) === String(item.community?.id)) ||
    (user.membership && user.membership.role === 'representative' && String(user.membership.community) === String(item.community?.id)) ||
    (String(user.id) === String(item.author?.id || item.author))
  );

  const canEdit = canDelete; // Symmetric for announcements

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
          <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold overflow-hidden border border-zinc-200 uppercase text-xs tracking-wider">
            {getProfileImage(item) ? (
              <img src={getProfileImage(item)} alt={getDisplayName(item)} className="h-full w-full object-cover" />
            ) : (
              <span>{getInitials(getDisplayName(item))}</span>
            )}
          </div>
          <div>
            <p
                className="text-sm font-semibold text-surface-dark cursor-pointer hover:underline underline-offset-2 transition-colors hover:text-primary"
                onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/community/${item.community?.id || item.community}`);
                }}
            >
                {getDisplayName(item)}
            </p>
            <p className="text-metadata">
              {getRoleLabel(item)} • {formatTimeAgo(item.createdAt || item.created_at)}
            </p>
          </div>
        </header>

        <div className="flex items-center gap-2">
          <Badge variant="red">Announcement</Badge>
          {item.visibility && (
            <Badge variant={item.visibility === 'public' ? 'success' : 'gray'}>
              {item.visibility}
            </Badge>
          )}

          {(canEdit || canDelete) && (
            <Dropdown
              actions={[
                ...(canEdit ? [{
                  label: 'Edit',
                  icon: <Edit size={14} />,
                  onClick: () => {
                    const communityId = item.community?.id || item.community;
                    navigate(`/community/${communityId}/manage/announcements/edit/${item.id}`);
                  }
                }] : []),
                ...(canDelete ? [{
                  label: 'Delete',
                  icon: <Trash2 size={14} />,
                  onClick: handleDelete,
                  variant: 'danger'
                }] : [])
              ]}
            />
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

        {item.image && (
          <div className="mt-4 rounded-xl overflow-hidden bg-zinc-50 border border-surface-border/50 aspect-video">
            <img
              src={item.image}
              alt="Announcement content"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </Card>
  )
}
