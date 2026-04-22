import { useState, useEffect } from 'react';
import Navbar from '../../../shared/components/layout/Navbar';
import Footer from '../../../shared/components/layout/Footer';
import PageHeader from '../../../shared/components/layout/PageHeader';
import AnnouncementCard from '../components/AnnouncementCard';
import announcementService from '../service/announcementService';
import { FeedItemSkeleton } from '../../feed/components/FeedItem';
import PaginationInfo from '../../../shared/components/pagination/PaginationInfo';
import PaginationControls from '../../../shared/components/pagination/PaginationControls';
import CreateButton from '../../../shared/components/ui/CreateButton';
import apiClient from '../../../shared/services/apiClient';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';

export default function AnnouncementsList() {
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [menuOpen, setMenuOpen] = useState(false);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [communities, setCommunities] = useState([]);
    const navigate = useNavigate();
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
                setTotalCount(data.count || mappedAnnouncements.length);
            } catch (error) {
                console.error('Failed to fetch announcements', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [page, selectedCommunityId, itemsPerPage]);

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
                <div className="mx-auto w-full max-w-4xl px-4">
                    <PageHeader
                        title="All Announcements"
                        subtitle="Be updated with every announcement."
                        backLinkTo="/feed"
                        backLinkText="Feeds"
                    >
                        {canCreate && (
                            <CreateButton
                                onClick={() => {
                                    const targetCommunityId = selectedCommunityId || (user.role === 'community' ? user.id : user.membership?.community);
                                    if (targetCommunityId) {
                                        navigate(`/community/${targetCommunityId}/manage/announcements/create`);
                                    }
                                }}
                            >
                                Create Announcement
                            </CreateButton>
                        )}
                    </PageHeader>

                    <div className="mb-8 rounded-[20px] border border-surface-border bg-white p-4 md:p-5">
                        <div className="flex flex-col gap-2 md:max-w-sm">
                            <label htmlFor="communityFilter" className="text-xs font-semibold uppercase tracking-wider text-surface-muted">
                                Filter by community
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
            </main>
            <Footer />
        </div>
    );
}
