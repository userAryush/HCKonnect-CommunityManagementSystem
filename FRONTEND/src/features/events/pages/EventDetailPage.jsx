import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Navbar from '../../../shared/components/layout/Navbar';
import eventService from '../service/eventService';
import Toast from '../../../shared/components/ui/Toast';

// Import the new components
import EventHero from '../components/EventDetails/EventHero';
import EventAdminBar from '../components/EventDetails/EventAdminBar';
import EventAbout from '../components/EventDetails/EventAbout';
import EventSpeakers from '../components/EventDetails/EventSpeakers';
import RegistrationSidebar from '../components/EventDetails/RegistrationSidebar';

export default function EventDetailPage() {
    const { eventId } = useParams()
    const navigate = useNavigate()
    const [event, setEvent] = useState(null)
    const [loading, setLoading] = useState(true)
    const [menuOpen, setMenuOpen] = useState(false)
    const [toast, setToast] = useState('')
    const [currentUser, setCurrentUser] = useState(null)

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setCurrentUser(JSON.parse(userStr));
        }

        const fetchEvent = async () => {
            try {
                const data = await eventService.getEvent(eventId);
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
                        id: data.community,
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

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            try {
                await eventService.deleteEvent(eventId);
                navigate('/events', { state: { success: 'Event deleted successfully' } });
            } catch (error) {
                console.error("Failed to delete event", error);
                setToast("Failed to delete event.");
            }
        }
    }

    const handleRegistrationRedirect = () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        navigate(`/events/${eventId}/register`);
    };

    if (loading) return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    )

    if (!event) return (
        <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center gap-4">
            <p className="text-xl font-bold text-zinc-900">Event not found</p>
            <Link to="/events" className="text-primary font-bold hover:underline">Back to Events</Link>
        </div>
    )

    const { eventMeta, community } = event

    const isCreator = currentUser && (
        (String(currentUser.id) === String(event.created_by)) ||
        (currentUser.role === 'community' && String(currentUser.id) === String(event.community.id || event.community)) ||
        (currentUser.membership && currentUser.membership.role === 'representative' && String(currentUser.membership.community) === String(event.community.id || event.community))
    );

    const deadlinePassed = eventMeta.registrationDeadline && new Date(eventMeta.registrationDeadline) < new Date();
    const isFull = eventMeta.maxParticipants && eventMeta.registeredCount >= eventMeta.maxParticipants;

    return (
        <div className="min-h-screen bg-[#fcfcfc] text-zinc-900 selection:bg-primary/20">
            <Navbar
                menuOpen={menuOpen}
                toggleMenu={() => setMenuOpen((v) => !v)}
                closeMenu={() => setMenuOpen(false)}
                navSolid={true}
            />
            <Toast message={toast} onClose={() => setToast('')} />

            <EventHero
                title={event.title}
                image={event.image}
                format={eventMeta.format}
                deadlinePassed={deadlinePassed}
                eventMeta={eventMeta}
            />

            <main className="mx-auto w-full max-w-7xl px-4 py-16">
                <div className="grid grid-cols-1 gap-16 lg:grid-cols-10">
                    {/* Left Side (70%) */}
                    <div className="lg:col-span-7 space-y-16">
                        {isCreator && (
                            <EventAdminBar
                                communityId={community?.id}
                                eventId={eventId}
                                registeredCount={eventMeta.registeredCount}
                                onDelete={handleDelete}
                            />
                        )}

                        <EventAbout description={event.description} />

                        {eventMeta.whatToExpect && eventMeta.whatToExpect.length > 0 && (
                            <section aria-label="What you'll learn">
                                <h3 className="text-2xl font-black mb-10 tracking-tight flex items-center gap-4">
                                    What you'll learn
                                </h3>
                                <div className="space-y-3">
                                    {eventMeta.whatToExpect.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-700 text-sm font-bold">
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        <EventSpeakers speakers={eventMeta.speakers} />
                    </div>

                    {/* Right Side (30%) - Sticky Sidebar */}
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
        </div>
    )
}
