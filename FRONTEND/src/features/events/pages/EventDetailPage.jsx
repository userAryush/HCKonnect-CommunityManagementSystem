import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Navbar from '../../../shared/components/layout/Navbar';
import eventService from '../service/eventService';
import Toast from '../../../shared/components/ui/Toast';
import EventHero from '../components/EventDetails/EventHero';
import EventAdminBar from '../components/EventDetails/EventAdminBar';
import EventAbout from '../components/EventDetails/EventAbout';
import EventSpeakers from '../components/EventDetails/EventSpeakers';
import RegistrationSidebar from '../components/EventDetails/RegistrationSidebar';
import Footer from '../../../shared/components/layout/Footer';
import BackLink from '../../../shared/components/layout/BackLink';
import ConfirmationModal from '../../../shared/components/modals/ConfirmationModal';
import EventRegistrationModal from '../components/shared/EventRegistrationModal';

export default function EventDetailPage() {
    const { eventId } = useParams()
    const navigate = useNavigate()
    const [event, setEvent] = useState(null)
    const [loading, setLoading] = useState(true)
    const [menuOpen, setMenuOpen] = useState(false)
    const [toast, setToast] = useState('')
    const [currentUser, setCurrentUser] = useState(null)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [registrationModalOpen, setRegistrationModalOpen] = useState(false)

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setCurrentUser(JSON.parse(userStr));
        }

        const fetchEvent = async () => {
            try {
                const data = await eventService.getEvent(eventId);
                const normalizedCommunityId = data.community?.id ?? data.community;
                setEvent({
                    ...data,
                    eventMeta: {
                        date: data.date,
                        time: data.start_time,
                        location: data.location,
                        format: data.format,
                        whatToExpect: data.what_to_expect,
                        speakers: data.speakers,
                        registrationDeadline: data.registration_deadline,
                        maxParticipants: data.max_participants,
                        registeredCount: data.registered_count,
                        isRegistered: !!data.is_registered
                    },
                    community: {
                        id: normalizedCommunityId,
                        name: data.community_name,
                        logo: data.community_logo,
                        logoText: (data.community_name || 'CO').substring(0, 2).toUpperCase()
                    }
                });
            } catch (error) {
                console.error("Failed to fetch event", error);
                setToast("Failed to load event details.");
            } finally {
                setLoading(false);
            }
        };

        if (eventId) {
            fetchEvent();
        }
    }, [eventId]);

    const handleRegister = async () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        try {
            if (event.eventMeta.isRegistered) {
                if (window.confirm("Are you sure you want to unregister from this event?")) {
                    await eventService.unregisterFromEvent(eventId);
                    setToast("Successfully unregistered.");
                    setEvent(prev => ({
                        ...prev,
                        eventMeta: {
                            ...prev.eventMeta,
                            isRegistered: false,
                            registeredCount: prev.eventMeta.registeredCount - 1
                        }
                    }));
                }
            } else {
                await eventService.registerForEvent(eventId);
                setToast("Successfully registered!");
                setEvent(prev => ({
                    ...prev,
                    eventMeta: {
                        ...prev.eventMeta,
                        isRegistered: true,
                        registeredCount: prev.eventMeta.registeredCount + 1
                    }
                }));
            }
        } catch (error) {
            const errorMsg = error.response?.data?.non_field_errors?.[0] || error.response?.data?.detail || "Action failed.";
            setToast(errorMsg);
        }
    };

    const handleConfirmDeleteEvent = async () => {
        setDeleteLoading(true)
        try {
            await eventService.deleteEvent(eventId);
            setDeleteModalOpen(false);
            navigate('/events', { state: { success: 'Event deleted successfully' } });
        } catch (error) {
            console.error("Failed to delete event", error);
            setToast("Failed to delete event.");
        } finally {
            setDeleteLoading(false);
        }
    }

    const handleRegistrationRedirect = () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setRegistrationModalOpen(true);
    };

    const handleRegistered = () => {
        setToast('Registration successful!');
        setEvent((prev) => ({
            ...prev,
            eventMeta: {
                ...prev.eventMeta,
                isRegistered: true,
                registeredCount: prev.eventMeta.registeredCount + 1,
            },
        }));
    };

    if (loading) return (
        <div className="min-h-screen bg-secondary flex flex-col items-center justify-center gap-3 px-4">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
            <p className="text-metadata">Loading event…</p>
        </div>
    )

    if (!event) return (
        <div className="min-h-screen bg-secondary flex flex-col items-center justify-center gap-4 px-4 text-center">
            <p className="text-title text-xl">Event not found</p>
            <Link to="/events" className="text-body font-semibold text-primary hover:underline">
                Back to events
            </Link>
        </div>
    )

    const { eventMeta, community } = event
    const eventCommunityId = event.community?.id ?? event.community;

    const isCreator = currentUser && (
        (String(currentUser.id) === String(event.created_by)) ||
        (currentUser.role === 'community' && String(currentUser.id) === String(eventCommunityId)) ||
        (currentUser.membership && currentUser.membership.role === 'representative' && String(currentUser.membership.community) === String(eventCommunityId))
    );

    const deadlinePassed = eventMeta.registrationDeadline && new Date(eventMeta.registrationDeadline) < new Date();
    const isFull = eventMeta.maxParticipants && eventMeta.registeredCount >= eventMeta.maxParticipants;

    return (
        <div className="min-h-screen bg-secondary text-surface-body selection:bg-primary/20">
            <Navbar
                menuOpen={menuOpen}
                toggleMenu={() => setMenuOpen((v) => !v)}
                closeMenu={() => setMenuOpen(false)}
                navSolid={true}
            />
            <Toast message={toast} onClose={() => setToast('')} />

            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDeleteEvent}
                title="Delete this event?"
                message="This removes the event for everyone. Registrations and reminders tied to it will be affected. This cannot be undone."
                confirmText="Delete event"
                cancelText="Cancel"
                isLoading={deleteLoading}
                loadingText="Deleting…"
            />
            <EventRegistrationModal
                isOpen={registrationModalOpen}
                onClose={() => setRegistrationModalOpen(false)}
                eventId={eventId}
                event={event}
                currentUser={currentUser}
                onRegistered={handleRegistered}
                onError={setToast}
            />

            <EventHero
                title={event.title}
                image={event.image}
                format={eventMeta.format}
                deadlinePassed={deadlinePassed}
                eventMeta={eventMeta}
            />

            <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8">
                <BackLink to="/events" className="mb-8" />
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-10 lg:gap-14">
                    {/* Left column */}
                    <div className="lg:col-span-7 space-y-12">
                        {isCreator && (
                            <EventAdminBar
                                communityId={community?.id}
                                eventId={eventId}
                                registeredCount={eventMeta.registeredCount}
                                onDeleteClick={() => setDeleteModalOpen(true)}
                            />
                        )}

                        <EventAbout description={event.description} />

                        {eventMeta.whatToExpect && eventMeta.whatToExpect.length > 0 && (
                            <section aria-label="What you'll learn">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="h-5 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
                                    <h2 className="text-xl font-semibold tracking-tight text-surface-dark">
                                        What you&apos;ll learn
                                    </h2>
                                </div>
                                <ul className="space-y-2">
                                    {eventMeta.whatToExpect.map((item, idx) => (
                                        <li
                                            key={idx}
                                            className="card-border flex items-start gap-3 !py-3 !px-4"
                                        >
                                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                                            <span className="text-body leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        <EventSpeakers speakers={eventMeta.speakers} />
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-3">
                        <RegistrationSidebar
                            eventMeta={eventMeta}
                            community={community}
                            currentUser={currentUser}
                            deadlinePassed={deadlinePassed}
                            isFull={isFull}
                            onRegister={handleRegister}
                            onRegistrationRedirect={handleRegistrationRedirect}
                            shareUrl={window.location.href}
                            shareTitle={event.title}
                        />
                    </aside>
                </div>
            </main>
            <Footer />
        </div>
    )
}
