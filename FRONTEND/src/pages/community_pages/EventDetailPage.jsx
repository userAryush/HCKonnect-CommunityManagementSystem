import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Navbar from "../../components/Navbar";
import CommunityAvatar from "../../components/shared/CommunityAvatar";
import eventService from "../../services/eventService";
import Toast from "../../components/others/Toast";
import {
    Share2,
    Calendar,
    MapPin,
    Clock,
    Globe,
    Users,
    ArrowLeft,
    ChevronRight,
    CheckCircle2,
    ShieldCheck
} from 'lucide-react';

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
                        agenda: []
                    },
                    community: {
                        id: data.community,
                        name: data.community_name,
                        logo: data.community_logo,
                        logoText: (data.community_name || data.community?.name || 'CO').substring(0, 2).toUpperCase()
                    },
                    stats: {
                        registrations: { current: Math.floor(Math.random() * 45), capacity: 100 } // Mock fallback
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

    const handleShare = () => {
        const fullUrl = window.location.href;
        navigator.clipboard.writeText(fullUrl)
            .then(() => {
                setToast("Link copied to clipboard!");
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                setToast("Failed to copy link.");
            });
    }

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

    const canEdit = currentUser && (
        (String(currentUser.id) === String(event.created_by)) ||
        (currentUser.role === 'community' && String(currentUser.id) === String(event.community.id || event.community)) ||
        (currentUser.membership && currentUser.membership.role === 'representative' && String(currentUser.membership.community) === String(event.community.id || event.community))
    );

    return (
        <div className="min-h-screen bg-[#fcfcfc] text-zinc-900 selection:bg-primary/20">
            <Navbar
                menuOpen={menuOpen}
                toggleMenu={() => setMenuOpen((v) => !v)}
                closeMenu={() => setMenuOpen(false)}
                navSolid={true}
            />
            <Toast message={toast} onClose={() => setToast('')} />

            {/* Hero Section */}
            <div className="relative w-full h-[450px] md:h-[550px] overflow-hidden">
                <img
                    src={event.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"}
                    alt="Event Banner"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-zinc-950" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

                {/* Hero Content */}
                <div className="absolute inset-0 flex items-end">
                    <div className="mx-auto w-full max-w-7xl px-4 pb-12">
                        <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-6 duration-700">
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                <span className="px-3 py-1 rounded-full bg-primary text-white text-[11px] font-black uppercase tracking-wider shadow-lg shadow-primary/20">
                                    {eventMeta.format || 'In-Person'}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-wider border border-white/20">
                                    Upcoming
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-6xl font-black text-white mb-8 leading-[1.1] tracking-tight">
                                {event.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-y-4 gap-x-8 text-white/90">
                                <div className="flex items-center gap-3 group">
                                    <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 group-hover:bg-primary/20 transition-colors">
                                        <Calendar size={20} className="text-primary-light" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-white/50 uppercase tracking-wide">Date</span>
                                        <span className="font-bold">{eventMeta.date}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 group">
                                    <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 group-hover:bg-primary/20 transition-colors">
                                        <Clock size={20} className="text-primary-light" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-white/50 uppercase tracking-wide">Time</span>
                                        <span className="font-bold">{eventMeta.time}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 group">
                                    <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 group-hover:bg-primary/20 transition-colors">
                                        <MapPin size={20} className="text-primary-light" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-white/50 uppercase tracking-wide">Location</span>
                                        <span className="font-bold truncate max-w-[200px]" title={eventMeta.location}>{eventMeta.location}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="mx-auto w-full max-w-7xl px-4 py-16">

                {/* Layout Wrapper */}
                <div className="grid grid-cols-1 gap-16 lg:grid-cols-10">

                    {/* Left Side (70%) */}
                    <div className="lg:col-span-7 space-y-16">

                        {/* Admin Action Bar */}
                        {canEdit && (
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-100 mb-8 border-l-4 border-l-primary shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <span className="font-bold text-sm">Organizer Controls</span>
                                </div>
                                <div className="flex gap-3">
                                    <Link to={`/community/${community?.id}/manage/events/${eventId}/edit`} className="px-4 py-2 rounded-xl bg-white border border-zinc-200 text-xs font-bold hover:bg-zinc-100 transition-colors shadow-sm">
                                        Edit Details
                                    </Link>
                                    <button onClick={handleDelete} className="px-4 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors border border-red-100 shadow-sm">
                                        Delete Event
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* About Section */}
                        <section aria-label="About the event">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-8 w-1.5 rounded-full bg-primary" />
                                <h2 className="text-3xl font-black tracking-tight">About this event</h2>
                            </div>
                            <div className="prose prose-zinc max-w-none prose-p:leading-relaxed prose-p:text-zinc-600 prose-p:text-lg">
                                <p className="whitespace-pre-wrap">{event.description}</p>
                            </div>
                        </section>

                        {/* What you'll learn */}
                        {eventMeta.whatToExpect && eventMeta.whatToExpect.length > 0 && (
                            <section aria-label="What you'll learn">
                                <h3 className="text-2xl font-black mb-10 tracking-tight flex items-center gap-4">
                                    What you'll learn
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {eventMeta.whatToExpect.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-700 text-sm font-bold">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Speakers Section */}
                        {eventMeta.speakers && eventMeta.speakers.length > 0 && (
                            <section aria-label="Speakers">
                                <h2 className="text-2xl font-black mb-10 tracking-tight flex items-center gap-4">
                                    Guest Speakers
                                    <span className="text-sm font-bold px-3 py-1 bg-zinc-100 text-zinc-500 rounded-full tracking-normal">{eventMeta.speakers.length}</span>
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {eventMeta.speakers.map((speaker, idx) => (
                                        <div key={idx} className="group flex items-center gap-6 p-6 rounded-3xl bg-zinc-50 border border-zinc-100/50 hover:bg-white hover:border-zinc-200 hover:shadow-xl transition-all duration-300">
                                            <div className="relative shrink-0">
                                                <div className="h-20 w-20 rounded-2xl bg-zinc-200 flex items-center justify-center text-3xl font-black text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500 overflow-hidden shadow-inner">
                                                    {speaker.name ? speaker.name.charAt(0) : '?'}
                                                </div>
                                                <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-white shadow-lg border border-zinc-100 flex items-center justify-center text-primary">
                                                    <Globe size={14} />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-zinc-900 mb-1 group-hover:text-primary transition-colors">{speaker.name}</h3>
                                                <p className="text-xs font-black text-primary uppercase tracking-widest mb-2 opacity-80">{speaker.profession}</p>
                                                <p className="text-sm text-zinc-500 font-medium">Industry Expert</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right Side (30%) - Sticky Sidebar */}
                    <aside className="lg:col-span-3">
                        <div className="sticky top-32 space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">

                            {/* Registration Card */}
                            <div className="p-8 rounded-[40px] bg-white border border-zinc-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all">
                                    <Calendar size={120} />
                                </div>

                                <h3 className="text-2xl font-black mb-8 tracking-tight">Reserve your spot</h3>



                                <div className="flex flex-col gap-4">
                                    <Link
                                        to={`/events/${eventId}/register`}
                                        className="w-full py-5 rounded-2xl bg-primary text-white font-black text-center shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 group"
                                    >
                                        Register Now
                                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>

                                    <button
                                        onClick={handleShare}
                                        className="w-full py-4 rounded-2xl border border-zinc-200 bg-white font-bold text-zinc-700 hover:bg-zinc-50 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                                    >
                                        <Share2 size={18} />
                                        <span>Invite Friends</span>
                                    </button>
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
                                            <h4 className="font-black text-lg text-zinc-900">{community?.name || 'Community'}</h4>
                                            <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Verified Organizer</p>
                                        </div>
                                    </div>


                                    <Link
                                        to={`/community/${community?.id}`}
                                        className="w-full py-4 bg-secondary rounded-2xl border-2 border-gray-900 text-black font-black text-center text-sm hover:bg-secondary/90 active:scale-95 transition-all block"
                                    >
                                        View Community
                                    </Link>
                                </div>
                            </div>

                            {/* Back Link */}
                            <Link to="/events" className="flex items-center justify-center gap-2 text-zinc-400 font-bold hover:text-zinc-900 transition-colors text-sm">
                                <ArrowLeft size={16} />
                                <span>Back to all events</span>
                            </Link>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    )
}
