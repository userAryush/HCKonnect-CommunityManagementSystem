import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import AnnouncementCard from '../../components/cards/AnnouncementCard'
import announcementService from '../../services/announcementService'
import { FeedItemSkeleton } from '../../components/feed/FeedItem'
import { useNavigate, useSearchParams, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export default function AnnouncementsList() {
    const [menuOpen, setMenuOpen] = useState(false)
    const [announcements, setAnnouncements] = useState([])
    const [stats, setStats] = useState({ total_announcements: 0 })
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const navigate = useNavigate()
    const { id } = useParams()
    const [searchParams] = useSearchParams()
    const communityId = id || searchParams.get('community_id')

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isCommunity = user.role === 'community';
    const isRep = user.membership?.role === 'representative';
    const canCreate = isCommunity || isRep;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const [data, statsData] = await Promise.all([
                    announcementService.getAnnouncements(page, communityId),
                    announcementService.getAnnouncementStats(communityId)
                ])

                const mappedAnnouncements = data.results.map(a => ({
                    ...a,
                    type: 'announcement',
                    id: a.id,
                    createdAt: a.created_at,
                    community: {
                        id: a.community, // Preserve ID
                        name: a.community_name || 'Community',
                        logoText: (a.community_name || 'CO').substring(0, 2).toUpperCase()
                    },
                    author: {
                        name: a.uploaded_by || 'Admin'
                    }
                }));

                setAnnouncements(mappedAnnouncements)
                setTotalPages(data.total_pages)
                setStats(statsData)
            } catch (error) {
                console.error("Failed to fetch announcements", error)
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
                            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#75C043]">Updates</p>
                            <h1 className="mt-2 text-3xl font-bold">All Announcements</h1>
                            <div className="flex gap-4 mt-4 text-sm text-[#4b4b4b]">
                                <span><strong>{stats.total_announcements}</strong> Total Announcements</span>
                            </div>
                        </div>
                        {canCreate && (
                            <button
                                onClick={() => {
                                    const targetCommunityId = communityId || (user.role === 'community' ? user.id : user.membership?.community);
                                    if (targetCommunityId) {
                                        navigate(`/community/${targetCommunityId}/manage/announcements/create`);
                                    } else {
                                        alert("Could not determine community ID. Please go to your dashboard.");
                                    }
                                }}
                                className="rounded-xl bg-[#0d1f14] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1a3b26]"
                            >
                                + Create Announcement
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {announcements.map(item => (
                                    <AnnouncementCard key={item.id} item={item} className="w-full" />
                                ))}
                            </div>

                            {announcements.length === 0 && (
                                <div className="text-center py-12 text-[#4b4b4b]">
                                    No announcements found.
                                </div>
                            )}

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
