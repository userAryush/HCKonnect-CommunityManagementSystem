import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import discussionService from '../../services/discussionService';
import DiscussionCard from '../../components/cards/DiscussionCard';
import Navbar from '../../components/Navbar';

export default function DiscussionList() {
    const [discussions, setDiscussions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDiscussions();
    }, [page]);

    const fetchDiscussions = async () => {
        setLoading(true);
        try {
            const data = await discussionService.getDiscussions(page);
            setDiscussions(data.results);
            setTotalPages(Math.ceil(data.count / 10)); // Assuming 10 items per page from backend
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
        <div className="min-h-screen bg-gray-50 flex flex-col pt-20">
            <Navbar navSolid={true} />
            <div className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Discussions</h1>
                        <p className="mt-1 text-gray-500">Join the conversation with the community.</p>
                    </div>
                    <button
                        onClick={() => navigate('/discussions/create')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-sm font-medium"
                    >
                        <Plus size={20} />
                        New Discussion
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-10">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-green-600"></div>
                        <p className="mt-2 text-gray-500">Loading discussions...</p>
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
                            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                                <p className="text-gray-500">No discussions found. Be the first to start one!</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-8 gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1 bg-white border border-gray-300 rounded-md disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1 bg-gray-100 rounded-md flex items-center">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 bg-white border border-gray-300 rounded-md disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
