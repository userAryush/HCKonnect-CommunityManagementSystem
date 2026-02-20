import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Image as ImageIcon, X } from 'lucide-react';
import postService from '../../services/postService';
import Navbar from '../../components/Navbar';
import PostCard from '../../components/cards/PostCard';
import { Skeleton } from '../../components/shared/Skeleton';

export default function PostList() {
    const [searchParams] = useSearchParams();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

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
            fetchPosts();
        } catch (error) {
            console.error("Failed to create post", error);
            alert("Failed to create post");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-28">
            <Navbar navSolid={true} />
            <main className="max-w-2xl mx-auto px-4 pb-20">

                {/* Create Post Bar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                            {JSON.parse(localStorage.getItem('user'))?.first_name?.[0] || 'U'}
                        </div>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full px-4 py-2 flex-1 text-left transition"
                        >
                            What's on your mind?
                        </button>
                    </div>
                </div>

                {/* Create Post Modal/Sheet */}
                {showCreate && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                            <div className="flex items-center justify-between p-4 border-b">
                                <h2 className="text-black text-lg font-bold">Create Post</h2>
                                <button onClick={() => setShowCreate(false)} className="bg-red-300 text-white p-1 hover:bg-red-500 rounded-full">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-4">
                                <textarea
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                    placeholder="Share your thoughts..."
                                    className="w-full min-h-[150px] p-2 resize-none outline-none text-lg text-black"
                                />

                                {imagePreview && (
                                    <div className="relative mt-2 rounded-xl overflow-hidden border">
                                        <img src={imagePreview} alt="Preview" className="w-full max-h-[300px] object-cover" />
                                        <button
                                            onClick={() => {
                                                setNewPostImage(null);
                                                setImagePreview(null);
                                            }}
                                            className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}

                                <div className="mt-4 flex items-center justify-between">
                                    <label className="flex items-center gap-2 text-[#75C043] hover:bg-blue-[#75C043] px-3 py-2 rounded-lg cursor-pointer transition">
                                        <ImageIcon size={20} />
                                        <span className="font-bold text-sm">Photo</span>
                                        <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                                    </label>
                                    <button
                                        onClick={handleCreatePost}
                                        disabled={submitting || (!newPostContent.trim() && !newPostImage)}
                                        className="bg-[#75C043] text-white px-8 py-2 rounded-lg font-bold hover:bg-[#62a337] disabled:opacity-50 transition"
                                    >
                                        {submitting ? 'Posting...' : 'Post'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Post List */}
                <div className="space-y-4">
                    {posts.map(post => (
                        <PostCard key={post.id} post={post} onDelete={(id) => setPosts(prev => prev.filter(p => p.id !== id))} />
                    ))}

                    {loading && (
                        <div className="space-y-4">
                            <Skeleton className="h-40 w-full" />
                            <Skeleton className="h-40 w-full" />
                        </div>
                    )}

                    {!loading && hasMore && (
                        <button
                            onClick={() => setPage(prev => prev + 1)}
                            className="w-full py-3 text-blue-600 font-bold hover:bg-blue-50 rounded-xl transition"
                        >
                            Load more
                        </button>
                    )}

                    {!loading && posts.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
                            <p className="text-gray-500 font-bold">No posts yet. Be the first to post!</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
