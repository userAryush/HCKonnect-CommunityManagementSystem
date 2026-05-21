import { useState, useEffect } from 'react'
import Navbar from '../../../shared/components/layout/Navbar'
import EventCard from '../components/shared/EventCard'
import CreateEventModal from '../components/CreateEventModal'
import EditEventModal from '../components/EditEventModal'
import eventService from '../service/eventService'
import { FeedItemSkeleton } from '../../feed/components/FeedItem'
import { useSearchParams, useParams } from 'react-router-dom'
import Pagination from '../../../shared/components/pagination/Pagination'

export default function EventsList() {
    const [menuOpen, setMenuOpen] = useState(false)
    const [events, setEvents] = useState([])
    const [stats, setStats] = useState({ total_events: 0, upcoming_events: 0 })
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(20)
    const [totalCount, setTotalCount] = useState(0)
    const [createEventModalOpen, setCreateEventModalOpen] = useState(false)
    const [editEventModalOpen, setEditEventModalOpen] = useState(false)
    const [editingEventId, setEditingEventId] = useState(null)
    const [eventsRefreshKey, setEventsRefreshKey] = useState(0)
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
        setPage(1)
    }, [communityId])

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const [eventsData, statsData] = await Promise.all([
                    eventService.getEvents(communityId, page, itemsPerPage),
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
                    registered_count: e.registered_count || 0,
                    max_participants: e.max_participants,
                    community: {
                        name: e.community_name || 'Community',
                        logoText: (e.community_name || 'CO').substring(0, 2).toUpperCase()
                    }
                }));

                setEvents(mappedEvents)
                setTotalCount(eventsData.count ?? 0)
                setStats(statsData)
            } catch (error) {
                console.error("Failed to fetch events", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [communityId, page, itemsPerPage, eventsRefreshKey])

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage)
        setPage(1)
    }

    return (
        <div className="bg-[#f4f5f2] min-h-screen">
            <Navbar
                menuOpen={menuOpen}
                toggleMenu={() => setMenuOpen((v) => !v)}
                closeMenu={() => setMenuOpen(false)}
                navSolid={true}
            />
            <main className="pt-24 pb-16">
                <div className="mx-auto w-full max-w-6xl px-4">
                    <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="mt-2 text-3xl font-bold">Upcoming Events</h1>
                            <div className="flex gap-4 mt-4 text-sm text-[#4b4b4b]">
                                <span><strong>{stats.upcoming_events}</strong> Upcoming</span>
                                <span>•</span>
                                <span><strong>{stats.total_events}</strong> Total Events</span>
                            </div>
                        </div>
                        {canCreate && (
                            <button
                                type="button"
                                onClick={() => {
                                    const targetCommunityId = communityId || (user.role === 'community' ? user.id : user.membership?.community);
                                    if (targetCommunityId) {
                                        setCreateEventModalOpen(true);
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
                            <div className="flex flex-col gap-4 text-left">
                                {events.map(event => (
                                    <EventCard
                                        key={event.id}
                                        item={event}
                                        onEdit={(item) => {
                                            setEditingEventId(item.id)
                                            setEditEventModalOpen(true)
                                        }}
                                        onDelete={(eventId) =>
                                            setEvents((prev) => prev.filter((e) => e.id !== eventId))
                                        }
                                    />
                                ))}
                            </div>

                            {events.length === 0 && (
                                <div className="text-center py-12 text-[#4b4b4b]">
                                    No events found.
                                </div>
                            )}

                            <Pagination
                                totalItems={totalCount}
                                itemsPerPage={itemsPerPage}
                                currentPage={page}
                                onPageChange={setPage}
                                onItemsPerPageChange={handleItemsPerPageChange}
                                className="mt-12"
                            />
                        </>
                    )}
                </div>
            </main>

            {canCreate && (communityId || user.role === 'community' || user.membership?.community) && (
                <CreateEventModal
                    isOpen={createEventModalOpen}
                    onClose={() => setCreateEventModalOpen(false)}
                    communityId={
                        communityId ||
                        (user.role === 'community' ? user.id : user.membership?.community)
                    }
                    onCreated={() => {
                        setCreateEventModalOpen(false);
                        setEventsRefreshKey((k) => k + 1);
                    }}
                />
            )}

            <EditEventModal
                isOpen={editEventModalOpen}
                eventId={editingEventId}
                onClose={() => {
                    setEditEventModalOpen(false)
                    setEditingEventId(null)
                }}
                onUpdated={() => {
                    setEditEventModalOpen(false)
                    setEditingEventId(null)
                    setEventsRefreshKey((k) => k + 1)
                }}
            />
        </div>
    )
}
