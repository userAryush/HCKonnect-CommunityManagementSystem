import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import discussionService from '../../services/discussionService';
import DiscussionCard from '../../components/cards/DiscussionCard';
import Navbar from '../../components/Navbar';
import Button from '../../components/shared/Button';
import Card from '../../components/shared/Card';

export default function DiscussionList() {
    const [discussions, setDiscussions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchDiscussions();
    }, [page]);

    const fetchDiscussions = async () => {
        setLoading(true);
        try {
            const data = await discussionService.getDiscussions(page);
            setDiscussions(data.results);
            setTotalPages(Math.ceil(data.count / 10)); 
        } catch (error) {
            console.error("Failed to fetch discussions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        setDiscussions(discussions.filter(d => d.id !== id));
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col pt-20 pb-12">
            <Navbar navSolid={true} />
            <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 mt-4">

                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-surface-dark sm:text-3xl">Community Discussions</h1>
                        <p className="text-sm text-surface-muted mt-1">Deep dives, debates, and detailed conversations.</p>
                    </div>
                    <Button
                        onClick={() => navigate('/discussions/create')}
                        className="flex items-center gap-2"
                    >
                        <Plus size={18} />
                        New Discussion
                    </Button>
                </div>

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

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-12 gap-4">
                        <Button
                            variant="secondary"
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="!py-1.5 !px-4 !text-xs"
                        >
                            Previous
                        </Button>
                        <span className="text-metadata font-bold text-zinc-600">
                            Page {page} of {totalPages}
                        </span>
                        <Button
                            variant="secondary"
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="!py-1.5 !px-4 !text-xs"
                        >
                            Next
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}
