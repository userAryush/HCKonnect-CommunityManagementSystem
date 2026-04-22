import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Image as ImageIcon, X } from 'lucide-react';
import postService from '../service/postService';
import Navbar from '../../../shared/components/layout/Navbar';
import PostCard from '../components/PostCard';
import { Skeleton } from '../../../shared/components/layout/Skeleton';
import Card from '../../../shared/components/card/Card';
import Button from '../../../shared/components/ui/Button';
import { useToast } from '../../../shared/components/ui/ToastContext';

export default function PostList() {
    const [searchParams] = useSearchParams();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if (searchParams.get('create') === 'true') {
            setShowCreate(true);
        }
    }, [searchParams]);

    // Create Post State
    const [showCreate, setShowCreate] = useState(false);
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostImage, setNewPostImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, [page]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const data = await postService.getPosts(page);
            if (page === 1) {
                setPosts(data.results);
            } else {
                setPosts(prev => [...prev, ...data.results]);
            }
            setHasMore(!!data.next);
        } catch (error) {
            console.error("Failed to fetch posts", error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewPostImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim() && !newPostImage) return;

        setSubmitting(true);
        const formData = new FormData();
        formData.append('content', newPostContent);
        if (newPostImage) {
            formData.append('image', newPostImage);
        }

        try {
            await postService.createPost(formData);
            setNewPostContent('');
            setNewPostImage(null);
            setImagePreview(null);
            setShowCreate(false);
            setPage(1);
            showToast('post created successfully.', 'success');
            fetchPosts();
        } catch (error) {
            console.error("Failed to create post", error);
            showToast('Failed to create post. Please try again.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] pt-28">
            <Navbar navSolid={true} />
            <main className="max-w-4xl mx-auto px-4 pb-20">

                <header className="mb-8">
                    <h1 className="text-2xl font-bold tracking-tight text-surface-dark sm:text-3xl">Community Posts</h1>
                    <p className="text-sm text-surface-muted mt-1">Shared stories and updates from your neighbors.</p>
                </header>

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

                {/* Create Post Modal/Sheet */}
                {showCreate && (
                    <div className="fixed inset-0 bg-zinc-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 border border-surface-border">
                            <div className="flex items-center justify-between p-4 border-b border-surface-border">
                                <h2 className="text-surface-dark text-lg font-semibold">Create Post</h2>
                                <button
                                    onClick={() => setShowCreate(false)}
                                    className="text-surface-muted hover:text-surface-dark p-2 hover:bg-zinc-100 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-4">
                                <textarea
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                    placeholder="Share your thoughts..."
                                    className="w-full min-h-[150px] p-2 resize-none outline-none text-sm text-surface-dark placeholder:text-surface-muted"
                                />

                                {imagePreview && (
                                    <div className="relative mt-2 rounded-xl overflow-hidden border border-surface-border">
                                        <img src={imagePreview} alt="Preview" className="w-full max-h-[300px] object-cover" />
                                        <button
                                            onClick={() => {
                                                setNewPostImage(null);
                                                setImagePreview(null);
                                            }}
                                            className="absolute top-2 right-2 p-1.5 bg-zinc-900/50 text-white rounded-full hover:bg-zinc-900/70 backdrop-blur-md"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}

                                <div className="mt-6 flex items-center justify-between">
                                    <label className="flex items-center gap-2 text-surface-muted hover:text-primary hover:bg-primary/5 px-3 py-2 rounded-lg cursor-pointer transition text-sm font-medium">
                                        <ImageIcon size={20} />
                                        <span>Add Photo</span>
                                        <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                                    </label>
                                    <Button
                                        onClick={handleCreatePost}
                                        disabled={!newPostContent.trim() && !newPostImage}
                                        isLoading={submitting}
                                        loadingText="Posting..."
                                        className="px-8"
                                    >
                                        Post
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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

                    {!loading && hasMore && (
                        <Button
                            variant="secondary"
                            onClick={() => setPage(prev => prev + 1)}
                            className="w-full py-3"
                        >
                            Load more
                        </Button>
                    )}

                    {!loading && posts.length === 0 && (
                        <Card className="text-center py-20 px-6 border-zinc-200 border-dashed bg-zinc-50/50 shadow-none">
                            <p className="text-surface-muted font-medium">No posts yet. Be the first to post!</p>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
}
