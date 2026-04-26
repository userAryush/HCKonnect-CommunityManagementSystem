import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import eventService from '../../service/eventService';
import Card from '../../../../shared/components/card/Card';
import CardHeader from '../../../../shared/components/card/CardHeader';
import CardActionMenu from '../../../../shared/components/card/CardActionMenu';
import Badge from '../../../../shared/components/ui/Badge';
import Button from '../../../../shared/components/ui/Button';
import ConfirmationModal from '../../../../shared/components/modals/ConfirmationModal';

export default function EventCard({ item, onDelete }) {
  const navigate = useNavigate();
  const { eventMeta, id } = item;
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const canManage = user && (
    (user.role === 'community' && String(user.id) === String(item.community?.id || item.community)) ||
    (user.membership && user.membership.role === 'representative' && String(user.membership.community) === String(item.community?.id || item.community))
  );

  const handleDelete = (e) => {
    if (e) e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await eventService.deleteEvent(item.id);
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
    const communityId = item.community?.id || item.community;
    navigate(`/community/${communityId}/manage/events/${item.id}/edit`);
  };

  const registeredCount = item.registered_count || 0;
  const maxParticipants = item.max_participants;
  const progress = maxParticipants ? Math.round((registeredCount / maxParticipants) * 100) : 0;
  const dateObj = new Date(eventMeta?.date || Date.now());
  const month = dateObj.toLocaleString('default', { month: 'short' });
  const day = dateObj.getDate();

  return (
    <>
      <Card
        onClick={() => navigate(`/events/${id}`)}
        className="cursor-pointer group relative"
      >
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
          <div className="flex flex-col items-center justify-center rounded-xl bg-secondary border border-surface-border px-3 py-2 min-w-[56px] h-fit">
            <span className="text-xl font-bold text-primary leading-none tracking-tighter">{day}</span>
            <span className="text-[10px] font-bold uppercase text-surface-muted mt-1 tracking-widest">{month}</span>
          </div>
        </CardHeader>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="amber">Event</Badge>
          </div>
          <div className="space-y-4">
            {item.image && (
              <div className="rounded-xl overflow-hidden bg-zinc-50 border border-surface-border/50 aspect-video">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-1">
              <h3 className="text-title transition-transform duration-200 ease-out group-hover:-translate-y-0.5">
                {item.title}
              </h3>
              <p className="text-metadata font-medium">
                📍 {eventMeta?.location} • {eventMeta?.time}
              </p>
              <p className="text-body line-clamp-2">
                {item.description}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-surface-border/50">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-surface-muted">Registration Progress</span>
            <span className="text-xs font-semibold text-surface-dark">{registeredCount} / {maxParticipants || '∞'}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full bg-primary transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex gap-3 mt-8">
            <Button
              variant="secondary"
              className="flex-1 py-1.5 !text-xs"
              onClick={(e) => { e.stopPropagation(); navigate(`/events/${id}`); }}
            >
              Details
            </Button>
            <Button
              variant="primary"
              className="flex-1 py-1.5 !text-xs"
              onClick={(e) => { e.stopPropagation(); navigate(`/events/${id}`); }}
            >
              Register Now
            </Button>
          </div>
        </div>
      </Card>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete event?"
        message="This action cannot be undone."
        confirmText="Delete"
        isLoading={isDeleting}
        loadingText="Deleting..."
      />
    </>
  );
}
