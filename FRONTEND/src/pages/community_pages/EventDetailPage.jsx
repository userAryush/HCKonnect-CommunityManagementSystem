import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Navbar from "../../components/Navbar";
import CommunityAvatar from "../../components/shared/CommunityAvatar";
import eventService from "../../services/eventService";
import Toast from "../../components/others/Toast";

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
                // Map API response to UI structure if needed, or use directly
                // API returns: title, description, date, start_time, location, format, image, speakers, what_to_expect, community (id), community_name, community_logo
                setEvent({
                    ...data,
                    eventMeta: {
                        date: data.date,
                        time: data.start_time,
                        location: data.location,
                        format: data.format,
                        whatToExpect: data.what_to_expect,
                        speakers: data.speakers,
                        agenda: [] // Not in API yet?
                    },
                    community: {
                        id: data.community,
                        name: data.community_name,
                        logoText: (data.community_name || 'CO').substring(0, 2).toUpperCase()
                    },
                    stats: {
                        registrations: { current: 0, capacity: 100 } // Mock for now
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

    if (loading) return <div className="p-10 text-center">Loading event...</div>
    if (!event) return <div className="p-10 text-center">Event not found.</div>

    const { eventMeta, community } = event

    // Permission check
    // Allow if: 
    // 1. User is the creator (event.created_by == user.id)
    // 2. User is the community account (user.id == event.community.id) AND role is community
    // 3. User is a representative of the SAME community

    // Debugging permissions
    console.log('CurrentUser:', currentUser);
    console.log('Event CreatedBy:', event.created_by);
    console.log('Event Community:', event.community);

    const canEdit = currentUser && (
        // Check if user is the creator (direct comparison)
        (String(currentUser.id) === String(event.created_by)) ||
        // Check if user is the community account owning the event
        (currentUser.role === 'community' && String(currentUser.id) === String(event.community.id || event.community)) ||
        // Check if user is a representative of the community
        (currentUser.membership && currentUser.membership.role === 'representative' && String(currentUser.membership.community) === String(event.community.id || event.community))
    );

    return (
        <div className="min-h-screen bg-[#f4f5f2] text-[#0d1f14]">
            <Navbar
                menuOpen={menuOpen}
                toggleMenu={() => setMenuOpen((v) => !v)}
                closeMenu={() => setMenuOpen(false)}
                navSolid={true}
            />
            <Toast message={toast} onClose={() => setToast('')} />

            {/* Hero Section */}
            <div className="relative h-80 w-full overflow-hidden bg-gray-900">
                <img
                    src={event.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"}
                    alt="Event Banner"
                    className="h-full w-full object-cover opacity-60"
                />
                <div className="absolute inset-0 flex items-end pb-10">
                    <div className="mx-auto w-full max-w-6xl px-4">
                        <div className="max-w-3xl rounded-2xl bg-black/60 p-8 text-white backdrop-blur-sm">
                            <span className="mb-2 inline-block rounded-full bg-[#75C043] px-3 py-1 text-xs font-bold uppercase text-[#0d1f14]">
                                {eventMeta.format || 'Event'}
                            </span>
                            <h1 className="mb-4 text-4xl font-bold">{event.title}</h1>
                            <div className="flex flex-wrap items-center gap-6 text-sm font-medium opacity-90">
                                <div className="flex items-center gap-2">
                                    <CommunityAvatar name={community.name} logoText={community.logoText} size="sm" />
                                    <span>Hosted by {community.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>📅 {eventMeta.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>📍 {eventMeta.location}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="mx-auto w-full max-w-6xl px-4 py-12">

                {/* Admin Actions */}
                {canEdit && (
                    <div className="mb-8 flex justify-end gap-4 border-b border-[#e5e7eb] pb-8">
                        <Link to={`/community/${community.id}/manage/events/${eventId}/edit`} className="rounded-xl border border-[#e5e7eb] bg-white px-6 py-2 font-bold text-[#0d1f14] hover:bg-[#f4f5f2]">
                            Edit Event
                        </Link>
                        <button onClick={handleDelete} className="rounded-xl bg-red-500 px-6 py-2 font-bold text-white hover:bg-red-600">
                            Delete Event
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Info Row */}
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4">
                                <p className="text-xs font-bold text-[#75C043] uppercase">Date</p>
                                <p className="font-semibold">{eventMeta.date}</p>
                            </div>
                            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4">
                                <p className="text-xs font-bold text-[#75C043] uppercase">Time</p>
                                <p className="font-semibold">{eventMeta.time}</p>
                            </div>
                            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4">
                                <p className="text-xs font-bold text-[#75C043] uppercase">Location</p>
                                <p className="font-semibold truncate" title={eventMeta.location}>{eventMeta.location}</p>
                            </div>
                            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4">
                                <p className="text-xs font-bold text-[#75C043] uppercase">Format</p>
                                <p className="font-semibold">{eventMeta.format || 'On-site'}</p>
                            </div>
                        </div>

                        {/* About */}
                        <section>
                            <h2 className="mb-4 text-2xl font-bold">About this event</h2>
                            <p className="text-lg leading-relaxed text-[#4b4b4b] whitespace-pre-wrap">
                                {event.description}
                            </p>
                        </section>

                        {/* What to Expect */}
                        {eventMeta.whatToExpect && eventMeta.whatToExpect.length > 0 && (
                            <section>
                                <h2 className="mb-4 text-2xl font-bold">What to expect</h2>
                                <ul className="grid gap-3 sm:grid-cols-2">
                                    {eventMeta.whatToExpect.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm">
                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#75C043]/20 text-[#75C043]">✓</span>
                                            <span className="font-medium text-[#4b4b4b]">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* Speakers */}
                        {eventMeta.speakers && eventMeta.speakers.length > 0 && (
                            <section>
                                <h2 className="mb-4 text-2xl font-bold">Speakers</h2>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    {eventMeta.speakers.map((speaker, idx) => (
                                        <div key={idx} className="flex items-center gap-4 rounded-2xl border border-[#e5e7eb] bg-white p-4">
                                            {/* <img src={speaker.avatar} alt={speaker.name} className="h-16 w-16 rounded-full object-cover bg-gray-200" /> */}
                                            <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-500">
                                                {speaker.name ? speaker.name.charAt(0) : '?'}
                                            </div>
                                            <div>
                                                <h3 className="font-bold">{speaker.name}</h3>
                                                <p className="text-xs text-[#75C043] font-semibold uppercase">{speaker.profession}</p>
                                                {/* <p className="text-sm text-[#4b4b4b]">{speaker.org}</p> */}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right Column */}
                    <aside className="space-y-8">
                        {/* Registration Card */}
                        <div className="sticky top-28 rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-lg">
                            <h3 className="text-xl font-bold mb-6">Register for this Event</h3>

                            <div className="mb-6 space-y-2">
                                <div className="flex justify-between text-xs font-semibold">
                                    <span>{event.stats?.registrations?.current || 0} registered</span>
                                    <span className="text-[#4b4b4b]">Capacity: {event.stats?.registrations?.capacity || 100}</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-[#e5e7eb] overflow-hidden">
                                    <div
                                        className="h-full bg-[#75C043]"
                                        style={{ width: `${Math.min(((event.stats?.registrations?.current || 0) / (event.stats?.registrations?.capacity || 100)) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>

                            <Link
                                to={`/events/${eventId}/register`}
                                className="mb-3 block w-full rounded-xl bg-[#75C043] py-4 text-center font-bold text-[#0d1f14] transition hover:bg-[#68ae3b]"
                            >
                                Register Now
                            </Link>

                            <button className="w-full rounded-xl border border-[#e5e7eb] bg-transparent py-3 font-semibold text-[#0d1f14] transition hover:bg-[#f4f5f2]">
                                Share Event
                            </button>
                        </div>

                        {/* Organizer Card */}
                        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-6">
                            <h3 className="text-sm font-bold uppercase text-[#4b4b4b] mb-4">Organizer</h3>
                            <div className="flex items-center gap-4 mb-6">
                                <CommunityAvatar name={community.name} logoText={community.logoText} size="md" />
                                <div>
                                    <h4 className="font-bold">{community.name}</h4>
                                    <span className="text-xs bg-[#f4f5f2] px-2 py-1 rounded-full text-[#4b4b4b]">Student Club</span>
                                </div>
                            </div>
                            <Link to={`/community/${community.id}`} className="block w-full rounded-xl bg-[#0d1f14] py-3 text-center text-sm font-bold text-white transition hover:opacity-90">
                                View Organizer Community
                            </Link>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    )
}
