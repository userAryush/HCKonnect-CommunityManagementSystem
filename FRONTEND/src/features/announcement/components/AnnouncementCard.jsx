import { useState } from 'react';
import announcementService from '../service/announcementService';
import Card from '../../../shared/components/card/Card';
import CardHeader from '../../../shared/components/card/CardHeader';
import CardActionMenu from '../../../shared/components/card/CardActionMenu';
import Badge from '../../../shared/components/ui/Badge';
import ConfirmationModal from '../../../shared/components/modals/ConfirmationModal';
import EditAnnouncementModal from './EditAnnouncementModal';

export default function AnnouncementCard({ item, onDelete }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemState, setItemState] = useState(item);
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
      await announcementService.deleteAnnouncement(itemState.id);
      setIsDeleteModalOpen(false);
      if (onDelete) onDelete(itemState.id);
      else window.location.reload();
    } catch (error) {
      console.error("Failed to delete", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (e) => {
    if (e) e.stopPropagation();
    setIsEditModalOpen(true);
  };

  return (
    <>
      <Card className="group relative">
        <CardHeader
          item={itemState}
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
          {itemState.visibility && (
            <Badge variant={itemState.visibility === 'public' ? 'success' : 'gray'}>
              {itemState.visibility}
            </Badge>
          )}
        </CardHeader>

        <div className="space-y-2 text-surface-body">
          <h3 className="text-title !text-surface-dark transition-transform duration-200 ease-out group-hover:-translate-y-0.5">
            {itemState.title}
          </h3>
          <p className="text-body !text-surface-body leading-relaxed">
            {itemState.description}
          </p>

          {itemState.image && (
            <div className="mt-4 rounded-xl overflow-hidden bg-zinc-50 border border-surface-border/50 flex items-center justify-center max-h-80">
              <img
                src={itemState.image}
                alt="Announcement content"
                className="w-full h-auto max-h-80 object-contain"
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

      <EditAnnouncementModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        announcement={itemState}
        onUpdated={(updated) => {
          setItemState((prev) => ({ ...prev, ...updated }));
        }}
      />
    </>
  );
}
