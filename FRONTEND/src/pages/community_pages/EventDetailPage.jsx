import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from "../../components/Navbar";

import CommunityAvatar from "../../components/shared/CommunityAvatar";

import { feedItems } from "../../data/feedItems";


export default function EventDetailPage() {
    const { eventId } = useParams()
    const [event, setEvent] = useState(null)
    const [isRegistered, setIsRegistered] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        // In a real app, fetch event by ID. Here we find it in mock data
        const foundEvent = feedItems.find(item => item.id === eventId && item.type === 'event')
        // Fallback or handle not found
        setEvent(foundEvent || feedItems.find(item => item.type === 'event')) // default to first event if not found
    }, [eventId])

    if (!event) return <div className="p-10 text-center">Loading event...</div>

    const { eventMeta, author, community } = event

    return (
        <div className="min-h-screen bg-[#f4f5f2] text-[#0d1f14]">
            <Navbar
                menuOpen={menuOpen}
                toggleMenu={() => setMenuOpen((v) => !v)}
                closeMenu={() => setMenuOpen(false)}
                navSolid={true}
            />

            {/* Hero Section */}
            <div className="relative h-80 w-full overflow-hidden bg-gray-900">
                <img
                    src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
                    alt="Event Banner"
                    className="h-full w-full object-cover opacity-60"
                />
                <div className="absolute inset-0 flex items-end pb-10">
                    <div className="mx-auto w-full max-w-6xl px-4">
                        <div className="max-w-3xl rounded-2xl bg-black/60 p-8 text-white backdrop-blur-sm">
                            <span className="mb-2 inline-block rounded-full bg-[#75C043] px-3 py-1 text-xs font-bold uppercase text-[#0d1f14]">
                                Event Series
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
                                <p className="font-semibold">{eventMeta.format || 'In-person'}</p>
                            </div>
                        </div>

                        {/* About */}
                        <section>
                            <h2 className="mb-4 text-2xl font-bold">About this event</h2>
                            <p className="text-lg leading-relaxed text-[#4b4b4b]">
                                {event.description}
                                <br /><br />
                                Join us for an immersive experience designed to boost your skills and network with like-minded individuals. Whether you are a beginner or looking to advance your knowledge, this event has something for everyone.
                            </p>
                        </section>

                        {/* What to Expect */}
                        {eventMeta.whatToExpect && (
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

                        {/* Agenda */}
                        {eventMeta.agenda && eventMeta.agenda.length > 0 && (
                            <section>
                                <h2 className="mb-4 text-2xl font-bold">Agenda</h2>
                                <div className="space-y-4">
                                    {eventMeta.agenda.map((slot, idx) => (
                                        <div key={idx} className="flex gap-6 rounded-2xl border border-[#e5e7eb] bg-white p-6 transition hover:shadow-md">
                                            <div className="shrink-0 font-bold text-[#75C043] w-20">{slot.time}</div>
                                            <div>
                                                <h3 className="font-bold">{slot.title}</h3>
                                                <p className="text-sm text-[#4b4b4b] mt-1">{slot.note}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Speakers */}
                        {eventMeta.speakers && eventMeta.speakers.length > 0 && (
                            <section>
                                <h2 className="mb-4 text-2xl font-bold">Speakers</h2>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    {eventMeta.speakers.map((speaker, idx) => (
                                        <div key={idx} className="flex items-center gap-4 rounded-2xl border border-[#e5e7eb] bg-white p-4">
                                            <img src={speaker.avatar} alt={speaker.name} className="h-16 w-16 rounded-full object-cover bg-gray-200" />
                                            <div>
                                                <h3 className="font-bold">{speaker.name}</h3>
                                                <p className="text-xs text-[#75C043] font-semibold uppercase">{speaker.role}</p>
                                                <p className="text-sm text-[#4b4b4b]">{speaker.org}</p>
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

                            <div className="mb-6 flex items-center justify-between text-sm font-medium text-[#4b4b4b]">
                                <span>Expected Attendees</span>
                                <span className="font-bold text-[#0d1f14]">{eventMeta.expectedAttendees || '50+'}</span>
                            </div>

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

                            {isRegistered ? (
                                <button
                                    disabled
                                    className="mb-3 w-full rounded-xl bg-[#e5e7eb] py-4 font-bold text-[#4b4b4b] transition"
                                >
                                    You are Registered
                                </button>
                            ) : (
                                <Link
                                    to={`/events/${eventId}/register`}
                                    className="mb-3 block w-full rounded-xl bg-[#75C043] py-4 text-center font-bold text-[#0d1f14] transition hover:bg-[#68ae3b]"
                                >
                                    Register Now
                                </Link>
                            )}

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
                            <Link to="/community" className="block w-full rounded-xl bg-[#0d1f14] py-3 text-center text-sm font-bold text-white transition hover:opacity-90">
                                View Organizer Community
                            </Link>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    )
}
