import { Link } from 'react-router-dom';
import Button from '../../../../shared/components/ui/Button';
import CommunityAvatar from '../../../../shared/components/ui/CommunityAvatar';
import ShareButton from '../../../../shared/components/card/ShareButton';
import { Calendar, Clock, Share2, ChevronRight, ArrowLeft } from 'lucide-react';

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
    return (
        <div className="sticky top-32 space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
            {/* Registration Card */}
            <div className="p-8 rounded-[40px] bg-[var(--surface-card)] border border-surface-border shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all">
                    <Calendar size={120} />
                </div>

                <h3 className="text-2xl font-black mb-8 tracking-tight text-[var(--surface-heading)]">Reserve your spot</h3>

                <div className="space-y-6 mb-8">
                    <div className="flex items-center justify-between text-sm font-bold">
                        <span className="text-surface-muted uppercase tracking-widest text-[10px]">Registered</span>
                        <span className="text-primary">{eventMeta.registeredCount} / {eventMeta.maxParticipants || '∞'}</span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden border border-surface-border/50">
                        <div
                            className="h-full bg-primary transition-all duration-1000"
                            style={{ width: `${eventMeta.maxParticipants ? (eventMeta.registeredCount / eventMeta.maxParticipants) * 100 : 0}%` }}
                        />
                    </div>

                    {eventMeta.registrationDeadline && (
                        <div className="p-4 rounded-2xl bg-secondary border border-surface-border flex items-center gap-3">
                            <div className="text-red-500">
                                <Clock size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-surface-muted uppercase tracking-widest">Deadline</p>
                                <p className="text-xs font-bold text-[var(--surface-heading)]">{new Date(eventMeta.registrationDeadline).toLocaleDateString()}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <Button
                        disabled={(!eventMeta.isRegistered && (deadlinePassed || isFull)) || (currentUser?.role === 'community')}
                        onClick={eventMeta.isRegistered ? onRegister : onRegistrationRedirect}
                        variant={eventMeta.isRegistered ? 'outline' : 'primary'}
                        className={`w-full !py-3 !rounded-xl !font-bold disabled:opacity-50 disabled:cursor-not-allowed ${eventMeta.isRegistered
                            ? '!bg-red-50 !text-red-600 !border-red-200 hover:!bg-red-100'
                            : 'shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]'
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
                        className="w-full !py-3 !rounded-xl !font-bold !text-surface-body hover:!bg-secondary active:scale-95"
                    >
                        <Share2 size={16} className="mr-2" />
                        <span>Invite Friends</span>
                    </ShareButton>
                </div>
            </div>

            {/* Organizer Profile Card */}
            <div className="p-8 rounded-[40px] bg-primary border-2 border-black/20 shadow-xl  relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />

                <div className="relative">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-1 rounded-2xl">
                            <CommunityAvatar name={community?.name} logo={community?.logo} size="md" className="rounded-xl" />
                        </div>
                        <div>
                            <h4 className="font-black text-lg text-surface-dark">{community?.name || 'Community'}</h4>
                            <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Verified Organizer</p>
                        </div>
                    </div>

                    <Button
                        as={Link}
                        to={`/community/${community?.id}`}
                        variant="secondary"
                        className="w-full !py-3 !rounded-xl !border-2 !border-gray-900 !text-black !font-bold !text-sm hover:!bg-secondary/90 active:scale-95"
                    >
                        View Community
                    </Button>
                </div>
            </div>

            {/* Back Link */}
            <Link to="/events" className="flex items-center justify-center gap-2 text-surface-muted font-bold hover:text-surface-dark transition-colors text-sm">
                <ArrowLeft size={16} />
                <span>Back to all events</span>
            </Link>
        </div>
    );
}