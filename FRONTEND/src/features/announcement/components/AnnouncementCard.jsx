import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import announcementService from '../service/announcementService';
import Card from '../../../shared/components/card/Card';
import CardHeader from '../../../shared/components/card/CardHeader';
import CardActionMenu from '../../../shared/components/card/CardActionMenu';
import Badge from '../../../shared/components/ui/Badge';
import ConfirmationModal from '../../../shared/components/modals/ConfirmationModal';

export default function AnnouncementCard({ item, onDelete }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const communityId = item.community?.id || item.community;
  const authorId = item.author?.id || item.author || item.created_by;

  const canManage = user && (
    (user.role === 'community' && String(user.id) === String(communityId)) ||
    (user.membership && user.membership.role === 'representative' && String(user.membership.community) === String(communityId)) ||
    (String(user.id) === String(authorId))
  );

  const handleDelete = (e) => {
    if (e) e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await announcementService.deleteAnnouncement(item.id);
      setIsDeleteModalOpen(false);
      if (onDelete) onDelete(item.id);
      else window.location.reload();
    } catch (error) {
      console.error("Failed to delete", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (e) => {
    if (e) e.stopPropagation();
    navigate(`/community/${communityId}/manage/announcements/edit/${item.id}`);
  };

  return (
    <>
      <Card className="group relative">
        <CardHeader
          item={item}
          actions={
            <CardActionMenu
              canEdit={canManage}
              onEdit={handleEdit}
              canDelete={canManage}
              onDelete={handleDelete}
            />
          }
        >
          <Badge variant="red">Announcement</Badge>
          {item.visibility && (
            <Badge variant={item.visibility === 'public' ? 'success' : 'gray'}>
              {item.visibility}
            </Badge>
          )}
        </CardHeader>

        <div className="space-y-2 text-surface-body">
          <h3 className="text-title !text-surface-dark transition-transform duration-200 ease-out group-hover:-translate-y-0.5">
            {item.title}
          </h3>
          <p className="text-body !text-surface-body leading-relaxed">
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

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete announcement?"
        message="This action cannot be undone."
        confirmText="Delete"
        isLoading={isDeleting}
        loadingText="Deleting..."
      />
    </>
  );
}
