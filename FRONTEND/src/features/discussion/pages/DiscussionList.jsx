import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import discussionService from '../service/discussionService';
import DiscussionCard from '../components/DiscussionCard';
import Navbar from '../../../shared/components/layout/Navbar';
import Footer from '../../../shared/components/layout/Footer';
import PageHeader from '../../../shared/components/layout/PageHeader';
import Card from '../../../shared/components/card/Card';
import PaginationInfo from '../../../shared/components/pagination/PaginationInfo';
import PaginationControls from '../../../shared/components/pagination/PaginationControls';
import CreateButton from '../../../shared/components/ui/CreateButton';

export default function DiscussionList() {
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [discussions, setDiscussions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDiscussions();
    }, [page, itemsPerPage]);

    const fetchDiscussions = async () => {
        setLoading(true);
        try {
            const data = await discussionService.getDiscussions({ page, pageSize: itemsPerPage });
            setDiscussions(data.results || []);
            setTotalCount(data.count ?? (data.results?.length || 0));
        } catch (error) {
            console.error("Failed to fetch discussions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        setDiscussions(discussions.filter(d => d.id !== id));
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-secondary text-surface-dark">
            <Navbar navSolid={true} />
            <main className="pt-24 pb-16">
                <div className="mx-auto w-full max-w-4xl px-4">
                    <PageHeader
                        title="Community Discussions"
                        subtitle="Deep dives, debates, and detailed conversations."
                        backLinkTo={`/feed`}
                        backLinkText="Feeds"
                    >
                        <CreateButton onClick={() => navigate('/discussions/create')}>
                            New Discussion
                        </CreateButton>
                    </PageHeader>
                    <PaginationInfo
                        totalItems={totalCount}
                        itemsPerPage={itemsPerPage}
                        currentPage={page}
                        onItemsPerPageChange={handleItemsPerPageChange}
                        className="mt-8 mb-4"
                    />
                    {loading ? (
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-48 w-full bg-zinc-100 rounded-standard animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {discussions.length > 0 ? (
                                discussions.map(discussion => (
                                    <DiscussionCard
                                        key={discussion.id}
                                        item={discussion}
                                        onDelete={handleDelete}
                                    />
                                ))
                            ) : (
                                <Card className="text-center py-20 px-6 border-zinc-200 border-dashed bg-zinc-50/50 shadow-none">
                                    <p className="text-surface-muted font-medium">No discussions found. Be the first to start one!</p>
                                </Card>
                            )}
                        </div>
                    )}

                    <PaginationControls
                        totalItems={totalCount}
                        itemsPerPage={itemsPerPage}
                        currentPage={page}
                        onPageChange={setPage}
                    />
                </div>
            </main>
            <Footer />
        </div>
    );
}
