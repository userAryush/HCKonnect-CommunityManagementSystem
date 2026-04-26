import { useState, useEffect } from 'react';
import Navbar from '../../../shared/components/layout/Navbar';
import Footer from '../../../shared/components/layout/Footer';
import AnnouncementCard from '../components/AnnouncementCard';
import CreateAnnouncementModal from '../components/CreateAnnouncementModal';
import announcementService from '../service/announcementService';
import { FeedItemSkeleton } from '../../feed/components/FeedItem';
import PaginationInfo from '../../../shared/components/pagination/PaginationInfo';
import PaginationControls from '../../../shared/components/pagination/PaginationControls';
import CreateButton from '../../../shared/components/ui/CreateButton';
import apiClient from '../../../shared/services/apiClient';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import BackLink from '../../../shared/components/layout/BackLink';

export default function AnnouncementsList() {
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [menuOpen, setMenuOpen] = useState(false);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [communities, setCommunities] = useState([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const initialCommunityId = id || searchParams.get('community_id') || '';
    const [selectedCommunityId, setSelectedCommunityId] = useState(initialCommunityId);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isCommunity = user.role === 'community';
    const isRep = user.membership?.role === 'representative';
    const canCreate = isCommunity || isRep;

    useEffect(() => {
        const fetchCommunities = async () => {
            try {
                const res = await apiClient.get('/communities/communities-list/');
                setCommunities(res.data || []);
            } catch (error) {
                console.error('Failed to fetch communities', error);
            }
        };

        fetchCommunities();
    }, []);

    useEffect(() => {
        setPage(1);
    }, [selectedCommunityId]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await announcementService.getAnnouncements({
                    page,
                    pageSize: itemsPerPage,
                    communityId: selectedCommunityId || null
                });

                const mappedAnnouncements = (data.results || []).map((a) => ({
                    ...a,
                    type: 'announcement',
                    createdAt: a.created_at,
                    community: {
                        id: a.community,
                        name: a.community_name || 'Community',
                        logoText: (a.community_name || 'CO').substring(0, 2).toUpperCase()
                    },
                    author: {
                        id: a.author || a.created_by || a.user || a.uploaded_by_id,
                        name: a.uploaded_by || 'Admin'
                    }
                }));

                setAnnouncements(mappedAnnouncements);
                setTotalCount(data.count ?? 0);
            } catch (error) {
                console.error('Failed to fetch announcements', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [page, selectedCommunityId, itemsPerPage, refreshKey]);

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-secondary text-surface-dark">
            <Navbar
                menuOpen={menuOpen}
                toggleMenu={() => setMenuOpen((v) => !v)}
                closeMenu={() => setMenuOpen(false)}
                navSolid={true}
            />

            <main className="pt-24 pb-16">
                <div className="mx-auto w-full max-w-6xl px-4">
                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                        <div className="lg:col-span-8 flex flex-col gap-6">
                            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                                <div>
                                    <div className="mb-1">
                                        <BackLink to="/feed" text="Feeds" />
                                    </div>
                                    <h1 className="text-2xl font-bold tracking-tight text-surface-dark sm:text-3xl">All Announcements</h1>
                                    <p className="text-sm text-surface-muted">Be updated with every announcement.</p>
                                </div>
                                {canCreate && (
                                    <CreateButton onClick={() => setIsCreateModalOpen(true)}>
                                        Create Announcement
                                    </CreateButton>
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
                                    <PaginationInfo
                                        totalItems={totalCount}
                                        itemsPerPage={itemsPerPage}
                                        currentPage={page}
                                        onItemsPerPageChange={handleItemsPerPageChange}
                                        className="mb-4"
                                    />
                                    <div className="flex flex-col gap-4">
                                        {announcements.map((item) => (
                                            <AnnouncementCard key={item.id} item={item} className="w-full" />
                                        ))}
                                    </div>

                                    {announcements.length === 0 && (
                                        <div className="card-border text-center text-surface-muted !py-12">
                                            No announcements found.
                                        </div>
                                    )}

                                    <PaginationControls
                                        totalItems={totalCount}
                                        itemsPerPage={itemsPerPage}
                                        currentPage={page}
                                        onPageChange={setPage}
                                        className="mt-8"
                                    />
                                </>
                            )}
                        </div>

                        <aside className="hidden lg:block lg:col-span-4 sticky top-24 self-start">
                            <div className="bg-white rounded-standard border border-surface-border shadow-sm p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="block rounded-full bg-primary" style={{ width: '3px', height: '16px' }} />
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-surface-muted">
                                        Filters
                                    </h3>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="communityFilter" className="text-[11px] font-semibold uppercase tracking-wider text-surface-muted">
                                        Community
                                    </label>
                                    <select
                                        id="communityFilter"
                                        value={selectedCommunityId}
                                        onChange={(e) => setSelectedCommunityId(e.target.value)}
                                        className="rounded-button border border-surface-border bg-white px-4 py-2.5 text-sm font-medium text-surface-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="">All communities</option>
                                        {communities.map((community) => (
                                            <option key={community.id} value={community.id}>
                                                {community.community_name || community.username}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
            <Footer />

            <CreateAnnouncementModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreated={() => {
                    setPage(1);
                    setRefreshKey((prev) => prev + 1);
                }}
            />
        </div>
    );
}
