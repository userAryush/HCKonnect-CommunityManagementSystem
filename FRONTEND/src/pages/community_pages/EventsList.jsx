import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import EventCard from '../../components/cards/EventCard'
import eventService from '../../services/eventService'
import { FeedItemSkeleton } from '../../components/feed/FeedItem'
import { useNavigate, useSearchParams, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export default function EventsList() {
    const [menuOpen, setMenuOpen] = useState(false)
    const [events, setEvents] = useState([])
    const [stats, setStats] = useState({ total_events: 0, upcoming_events: 0 })
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const navigate = useNavigate()
    const { id } = useParams()
    const [searchParams] = useSearchParams()
    const communityId = id || searchParams.get('community_id')

    // Determine user role (mock or from localStorage) - ideally use auth context
    const userRole = localStorage.getItem('user_role') || 'student'
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const isCommunity = user.role === 'community';
    // Robust check for representative: check if membership exists and role is representative
    const isRep = user.role === 'student' && user.membership && user.membership.role === 'representative';

    // Check if the user (community or rep) belongs to the CURRENT list's community (if we are in a specific community view)
    // If communityId is present (filtered view), we strictly check if they belong to THIS community.
    // If communityId is null (global view), they can create if they are a rep/community (and we'll redirect them to their community create page).
    const isAuthorizedForThisCommunity = !communityId || (
        (isCommunity && String(user.id) === String(communityId)) ||
        (isRep && String(user.membership.community) === String(communityId))
    );

    const canCreate = (isCommunity || isRep) && isAuthorizedForThisCommunity;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const [eventsData, statsData] = await Promise.all([
                    eventService.getEvents(communityId, page),
                    eventService.getEventStats(communityId)
                ])

                // Adapter similar to FeedList
                const mappedEvents = eventsData.results.map(e => ({
                    ...e,
                    type: 'event',
                    id: e.id,
                    createdAt: e.created_at,
                    eventMeta: {
                        date: e.date,
                        time: e.start_time,
                        location: e.location
                    },
                    stats: {
                        registrations: { current: 0, capacity: 100 }
                    },
                    community: {
                        name: e.community_name || 'Community',
                        logoText: (e.community_name || 'CO').substring(0, 2).toUpperCase()
                    }
                }));

                setEvents(mappedEvents)
                setTotalPages(eventsData.total_pages)
                setStats(statsData)
            } catch (error) {
                console.error("Failed to fetch events", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [page])

    return (
        <div className="bg-[#f4f5f2] min-h-screen">
            <Navbar
                menuOpen={menuOpen}
                toggleMenu={() => setMenuOpen((v) => !v)}
                closeMenu={() => setMenuOpen(false)}
                navSolid={true}
            />
            <main className="pt-24 pb-16">
                <div className="mx-auto w-full max-w-7xl px-4">
                    <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#75C043]">Discussion</p>
                            <h1 className="mt-2 text-3xl font-bold">Upcoming Events</h1>
                            <div className="flex gap-4 mt-4 text-sm text-[#4b4b4b]">
                                <span><strong>{stats.upcoming_events}</strong> Upcoming</span>
                                <span>•</span>
                                <span><strong>{stats.total_events}</strong> Total Events</span>
                            </div>
                        </div>
                        {canCreate && (
                            <button
                                onClick={() => {
                                    const targetCommunityId = communityId || (user.role === 'community' ? user.id : user.membership?.community);
                                    if (targetCommunityId) {
                                        navigate(`/community/${targetCommunityId}/manage/events/create`);
                                    } else {
                                        alert("Could not determine community ID. Please go to your dashboard.");
                                    }
                                }}
                                className="rounded-xl bg-[#0d1f14] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1a3b26]"
                            >
                                + Create Event
                            </button>
                        )}
                    </header>

                    {loading ? (
                        <div className="flex flex-col gap-6">
                            <FeedItemSkeleton />
                            <FeedItemSkeleton />
                            <FeedItemSkeleton />
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {events.map(event => (
                                    <EventCard key={event.id} item={event} />
                                ))}
                            </div>

                            {events.length === 0 && (
                                <div className="text-center py-12 text-[#4b4b4b]">
                                    No events found.
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-12 flex justify-center gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="p-2 rounded-lg border border-[#e5e7eb] bg-white disabled:opacity-50 hover:bg-gray-50"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                    <span className="flex items-center px-4 font-semibold">
                                        Page {page} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="p-2 rounded-lg border border-[#e5e7eb] bg-white disabled:opacity-50 hover:bg-gray-50"
                                    >
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}
