import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import postService from '../service/postService';
import Navbar from '../../../shared/components/layout/Navbar';
import Footer from '../../../shared/components/layout/Footer';
import PageHeader from '../../../shared/components/layout/PageHeader';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import { Skeleton } from '../../../shared/components/layout/Skeleton';
import Card from '../../../shared/components/card/Card';
import PaginationInfo from '../../../shared/components/pagination/PaginationInfo';
import PaginationControls from '../../../shared/components/pagination/PaginationControls';

export default function PostList() {
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [searchParams] = useSearchParams();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (searchParams.get('create') === 'true') {
            setShowCreate(true);
        }
    }, [searchParams]);

    const [showCreate, setShowCreate] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, [page, itemsPerPage, refreshKey]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const data = await postService.getPosts({ page, pageSize: itemsPerPage });
            setPosts(data.results || []);
            setTotalCount(data.count ?? (data.results?.length || 0));
        } catch (error) {
            console.error("Failed to fetch posts", error);
        } finally {
            setLoading(false);
        }
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
                        title="Community Posts"
                        subtitle="Shared stories and updates from your college."
                        backLinkTo={`/feed`}
            backLinkText="Feeds"
                    >
                    </PageHeader>

                    {/* Create Post Bar */}
                    <Card className="p-4 mb-6 !rounded-2xl">
                        <div className="flex gap-4 items-center">
                            <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold shrink-0">
                                {JSON.parse(localStorage.getItem('user'))?.first_name?.[0] || 'U'}
                            </div>
                            <button
                                onClick={() => setShowCreate(true)}
                                className="input-standard flex-1 text-left text-surface-muted hover:border-zinc-300 transition-colors"
                            >
                                What's on your mind?
                            </button>
                        </div>
                    </Card>

                    <PaginationInfo
                        totalItems={totalCount}
                        itemsPerPage={itemsPerPage}
                        currentPage={page}
                        onItemsPerPageChange={handleItemsPerPageChange}
                        className="mt-8 mb-4"
                    />
                    {/* Post List */}
                    <div className="space-y-4 mt-6">
                        {posts.map(post => (
                            <PostCard key={post.id} post={post} onDelete={(id) => setPosts(prev => prev.filter(p => p.id !== id))} />
                        ))}

                        {loading && (
                            <div className="space-y-4">
                                <Skeleton className="h-40 w-full rounded-standard" />
                                <Skeleton className="h-40 w-full rounded-standard" />
                            </div>
                        )}

                        {!loading && posts.length === 0 && (
                            <Card className="text-center py-20 px-6 border-zinc-200 border-dashed bg-zinc-50/50 shadow-none">
                                <p className="text-surface-muted font-medium">No posts yet. Be the first to post!</p>
                            </Card>
                        )}
                    </div>

                    <PaginationControls
                        totalItems={totalCount}
                        itemsPerPage={itemsPerPage}
                        currentPage={page}
                        onPageChange={setPage}
                    />
                </div>
            </main>
            <Footer />

            <CreatePostModal
                isOpen={showCreate}
                onClose={() => setShowCreate(false)}
                onCreated={() => {
                    setPage(1);
                    setRefreshKey((prev) => prev + 1);
                }}
            />
        </div>
    );
}
