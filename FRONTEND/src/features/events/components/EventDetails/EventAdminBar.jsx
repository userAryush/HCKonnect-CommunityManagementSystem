import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';

export default function EventAdminBar({ communityId, eventId, registeredCount, onDeleteClick, onEditClick }) {
    return (
        <div className="mb-2 flex flex-col gap-4 rounded-2xl border border-surface-border/80 bg-[var(--surface-card)] p-5 shadow-sm md:flex-row md:items-center md:justify-between md:border-l-4 md:border-l-primary">
            <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/15 p-3 text-primary">
                    <ShieldCheck size={22} strokeWidth={2} />
                </div>
                <div>
                    <p className="text-body font-semibold text-surface-dark">Organizer tools</p>
                    <p className="mt-0.5 text-metadata uppercase tracking-wide">
                        {registeredCount} registered
                    </p>
                </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
                <Link
                    to={`/community/${communityId}/manage/events/${eventId}/participants`}
                    className="inline-flex shrink-0 items-center justify-center rounded-xl bg-surface-dark px-4 py-2.5 text-xs font-semibold text-secondary transition-colors hover:bg-surface-dark/90"
                >
                    Participants
                </Link>
                <button
                    type="button"
                    onClick={onEditClick}
                    className="inline-flex shrink-0 items-center justify-center rounded-xl border border-surface-border bg-secondary px-4 py-2.5 text-xs font-semibold text-surface-dark transition-colors hover:bg-[var(--surface-muted-bg)]"
                >
                    Edit event
                </button>
                <Button
                    type="button"
                    variant="danger-outline"
                    onClick={onDeleteClick}
                    className="shrink-0 !rounded-xl !px-4 !py-2.5 !text-xs !font-semibold"
                >
                    Delete
                </Button>
            </div>
        </div>
    );
}