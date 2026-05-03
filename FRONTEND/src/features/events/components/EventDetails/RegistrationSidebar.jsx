import { Link } from 'react-router-dom';
import Button from '../../../../shared/components/ui/Button';
import ShareButton from '../../../../shared/components/card/ShareButton';
import { Calendar, Clock, Share2, ChevronRight, ArrowLeft } from 'lucide-react';
import { getInitials } from '../../../../utils/userUtils';

export default function RegistrationSidebar({
    eventMeta,
    community,
    currentUser,
    deadlinePassed,
    isFull,
    onRegister,
    onRegistrationRedirect,
    shareUrl,
    shareTitle
}) {
    const organizerName = community?.name || 'Community';
    const organizerInitials = getInitials(organizerName);
    const spotsOpen =
        eventMeta.maxParticipants != null
            ? Math.max(0, eventMeta.maxParticipants - eventMeta.registeredCount)
            : null;

    const organizerStatItems = [
        { num: eventMeta.registeredCount ?? '—', lbl: 'Going' },
        {
            num: eventMeta.maxParticipants != null ? eventMeta.maxParticipants : '∞',
            lbl: 'Capacity',
        },
        {
            num: spotsOpen != null ? spotsOpen : '—',
            lbl: 'Open',
        },
    ];

    return (
        <div className="sticky top-28 space-y-6">
            {/* Registration Card */}
            <div className="group relative overflow-hidden rounded-2xl border border-surface-border bg-[var(--surface-card)] p-6 shadow-sm">
                <div className="pointer-events-none absolute right-0 top-0 p-4 opacity-[0.06] transition-opacity group-hover:opacity-[0.1]">
                    <Calendar size={100} />
                </div>

                <h3 className="mb-6 text-xl font-semibold tracking-tight text-surface-dark">Reserve your spot</h3>

                <div className="mb-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-metadata font-medium uppercase tracking-wide">Registered</span>
                        <span className="text-body font-semibold text-primary">
                            {eventMeta.registeredCount} / {eventMeta.maxParticipants || '∞'}
                        </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full border border-surface-border/60 bg-secondary">
                        <div
                            className="h-full bg-primary transition-all duration-1000"
                            style={{ width: `${eventMeta.maxParticipants ? (eventMeta.registeredCount / eventMeta.maxParticipants) * 100 : 0}%` }}
                        />
                    </div>

                    {eventMeta.registrationDeadline && (
                        <div className="flex items-center gap-3 rounded-xl border border-surface-border bg-secondary p-3">
                            <div className="text-red-500" aria-hidden>
                                <Clock size={18} />
                            </div>
                            <div>
                                <p className="text-metadata font-medium uppercase tracking-wide">Deadline</p>
                                <p className="text-body font-semibold text-surface-dark">
                                    {new Date(eventMeta.registrationDeadline).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <Button
                        disabled={(!eventMeta.isRegistered && (deadlinePassed || isFull)) || (currentUser?.role === 'community')}
                        onClick={eventMeta.isRegistered ? onRegister : onRegistrationRedirect}
                        variant={eventMeta.isRegistered ? 'outline' : 'primary'}
                        className={`w-full !rounded-xl !py-3 !font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${eventMeta.isRegistered
                            ? '!border-red-200 !bg-red-50 !text-red-600 hover:!bg-red-100'
                            : 'shadow-primary/20 hover:scale-[1.01] active:scale-[0.99]'
                            }`}
                    >
                        {eventMeta.isRegistered ? (
                            <>Unregister</>
                        ) : deadlinePassed ? (
                            <>Deadline Passed</>
                        ) : isFull ? (
                            <>Event Full</>
                        ) : (
                            <>
                                Register Now
                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform ml-2" />
                            </>
                        )}
                    </Button>

                    <ShareButton
                        variant="outline"
                        url={shareUrl}
                        title={shareTitle}
                        text="Join this event on HCKonnect."
                        className="w-full !rounded-xl !py-3 !font-semibold !text-surface-body hover:!bg-secondary active:scale-[0.99]"
                    >
                        <Share2 size={16} className="mr-2" />
                        <span>Invite Friends</span>
                    </ShareButton>
                </div>
            </div>

            {/* Organizer — same shell as MiniProfileCard (feed) */}
            <div className="relative overflow-hidden rounded-standard border border-primary/30 bg-primary/[0.07]">
                <div className="relative flex flex-col items-center p-6">
                    <div className="mb-3">
                        {community?.logo ? (
                            <img
                                src={community.logo}
                                alt={organizerName}
                                className="h-16 w-16 rounded-full border-[2.5px] border-primary object-cover shadow-sm"
                            />
                        ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-full border-[2.5px] border-primary bg-white">
                                <span className="text-lg font-bold uppercase tracking-wider text-primary-hover">
                                    {organizerInitials}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="text-center">
                        <Link
                            to={`/community/${community?.id}`}
                            className="block text-[15px] font-semibold tracking-[-0.01em] text-surface-dark transition-opacity hover:opacity-70"
                        >
                            {organizerName}
                        </Link>
                        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-primary-hover">
                            Organizer
                        </p>
                    </div>


                    <Button
                        as={Link}
                        to={`/community/${community?.id}`}
                        variant="secondary"
                        className="mt-5 w-full !rounded-xl !border !border-surface-border !bg-white !py-2.5 !text-sm !font-semibold !text-surface-dark shadow-sm hover:!bg-secondary active:scale-[0.99]"
                    >
                        View community
                    </Button>
                </div>
            </div>

            <Link
                to="/feeds"
                className="flex items-center justify-center gap-2 text-sm font-semibold text-surface-muted transition-colors hover:text-primary"
            >
                <ArrowLeft size={16} aria-hidden />
                <span>Back to feed</span>
            </Link>
        </div>
    );
}