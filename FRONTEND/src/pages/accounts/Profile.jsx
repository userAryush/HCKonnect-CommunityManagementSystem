import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../services/api'
import AnnouncementCard from '../../components/cards/AnnouncementCard'
import DiscussionCard from '../../components/cards/DiscussionCard'
import EventCard from '../../components/cards/EventCard'
import PostCard from '../../components/cards/PostCard'
import postService from '../../services/postService'
import { Edit2, Linkedin, Github, Globe, MapPin, Calendar, Award } from 'lucide-react'

export default function Profile() {
    const { id } = useParams()
    const [profile, setProfile] = useState(null)
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [menuOpen, setMenuOpen] = useState(false)
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

    // If no ID is provided, it's the current user's profile
    const profileId = id || currentUser.id
    const isOwnProfile = !id || String(id) === String(currentUser.id)

    useEffect(() => {
        fetchProfile()
        fetchUserPosts()
    }, [id])

    const fetchProfile = async () => {
        setLoading(true)
        try {
            const res = await api.get(`/accounts/profile/${profileId}/`)
            setProfile(res.data)
        } catch (error) {
            console.error("Failed to load profile", error)
            // Fallback for current user if UUID endpoint is not fully ready or if accessing /profile
            if (isOwnProfile) {
                try {
                    const fallback = await api.get('/accounts/profile/')
                    setProfile(fallback.data)
                } catch (e) {
                    console.error("Fallback failed", e)
                }
            }
        } finally {
            setLoading(false)
        }
    }

    const fetchUserPosts = async () => {
        try {
            const data = await postService.getPosts(1, profileId);
            setPosts(data.results || []);
        } catch (error) {
            console.error("Failed to fetch user posts", error);
        }
    };

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-[#f4f5f2]">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#75C043] border-t-transparent" />
        </div>
    )

    if (!profile) return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#f4f5f2] p-4 text-center">
            <h2 className="text-2xl font-bold">Profile not found</h2>
            <Link to="/feed" className="mt-4 text-[#75C043] hover:underline">Back to Feed</Link>
        </div>
    )

    const displayName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username;
    const initial = (profile.username || 'U').charAt(0).toUpperCase();

    // Combine and sort activity
    const activity = [
        ...(profile.posted_content || []).map(item => ({ ...item, isLegacy: true })),
        ...posts.map(post => ({ ...post, type: 'post' }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return (
        <div className="min-h-screen bg-[#f4f5f2] text-[#0d1f14]">
            <Navbar
                menuOpen={menuOpen}
                toggleMenu={() => setMenuOpen((v) => !v)}
                closeMenu={() => setMenuOpen(false)}
                navSolid={true}
            />

            <main className="pt-24 pb-16">
                <div className="mx-auto w-full max-w-4xl px-4">
                    {/* Header Card */}
                    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                        {/* Cover Image */}
                        <div className="h-48 w-full bg-gradient-to-r from-[#75C043] to-[#0d1f14]" />

                        <div className="relative px-8 pb-8">
                            {/* Profile Image */}
                            <div className="absolute -top-16 left-8">
                                {profile.profile_image ? (
                                    <img
                                        src={profile.profile_image}
                                        alt={displayName}
                                        className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-md"
                                    />
                                ) : (
                                    <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-[#75C043] text-4xl font-bold text-[#0d1f14] shadow-md">
                                        {initial}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end pt-4">
                                {isOwnProfile && (
                                    <Link
                                        to="/profile/edit"
                                        className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-2 text-sm font-bold transition hover:bg-gray-50"
                                    >
                                        <Edit2 size={16} />
                                        Edit Profile
                                    </Link>
                                )}
                            </div>

                            {/* Name and Info */}
                            <div className="mt-6">
                                <h1 className="text-3xl font-black tracking-tight">{displayName}</h1>
                                <p className="text-gray-500 font-medium">@{profile.username}</p>

                                <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-gray-600">
                                    {profile.membership ? (
                                        <div className="flex items-center gap-2">
                                            <Award size={18} className="text-[#a16207]" />
                                            <span className="font-semibold text-gray-700">
                                                {profile.membership.role === 'representative' ? 'Representative' : 'Member'} of {profile.membership.community_name}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Award size={18} className="text-gray-400" />
                                            <span>Student</span>
                                        </div>
                                    )}

                                    {profile.course && (
                                        <div className="flex items-center gap-2">
                                            <Globe size={18} className="text-gray-400" />
                                            <span>{profile.course.toUpperCase()}</span>
                                        </div>
                                    )}
                                </div>

                                {profile.bio && (
                                    <p className="mt-6 max-w-2xl text-base leading-relaxed text-gray-700">
                                        {profile.bio}
                                    </p>
                                )}

                                {/* Links */}
                                <div className="mt-6 flex gap-4">
                                    {profile.linkedin_link && (
                                        <a href={profile.linkedin_link} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition">
                                            <Linkedin size={20} />
                                        </a>
                                    )}
                                    {profile.github_link && (
                                        <a href={profile.github_link} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 transition">
                                            <Github size={20} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="mt-10">
                        <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-2">
                            <h2 className="text-xl font-bold tracking-tight">Recent Activity</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {(activity.length > 0) ? (
                                activity.map((item, idx) => {
                                    if (item.type === 'announcement') return <AnnouncementCard key={`ann-${item.id}`} item={item} />
                                    if (item.type === 'discussion') return <DiscussionCard key={`disc-${item.id}`} item={item} />
                                    if (item.type === 'event') return <EventCard key={`ev-${item.id}`} item={item} />
                                    if (item.type === 'post') return <PostCard key={`post-${item.id}`} post={item} onDelete={(id) => setPosts(prev => prev.filter(p => p.id !== id))} />
                                    return null
                                })
                            ) : (
                                <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white/50 p-12 text-center">
                                    <p className="text-gray-500">No recent activity to show.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
