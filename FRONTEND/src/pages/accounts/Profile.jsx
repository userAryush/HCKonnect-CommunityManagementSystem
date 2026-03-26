import { useState, useEffect } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../services/api'
import AnnouncementCard from '../../components/cards/AnnouncementCard'
import DiscussionCard from '../../components/cards/DiscussionCard'
import EventCard from '../../components/cards/EventCard'
import PostCard from '../../components/cards/PostCard'
import postService from '../../services/postService'
import { Edit2, Linkedin, Github, Globe, MapPin, Calendar, Award } from 'lucide-react'
import { getDisplayName, getInitials, getProfileImage } from '../../utils/userUtils'

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

    const location = useLocation()

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
        <div className="flex min-h-screen items-center justify-center bg-secondary">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
    )

    if (!profile) return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-6 text-center">
            <h2 className="text-2xl font-display font-bold text-surface-dark">Profile not found</h2>
            <Link to="/feed" className="mt-4 text-primary font-bold hover:underline">Back to Feed</Link>
        </div>
    )

    const displayName = getDisplayName(profile);
    const profileImage = getProfileImage(profile);
    const initials = getInitials(displayName);

    // Combine and sort activity
    const activity = [
        ...(profile.posted_content || []),
        ...posts.map(post => ({ ...post, type: 'post' }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return (
        <div className="min-h-screen bg-secondary text-surface-dark antialiased">
            <Navbar
                menuOpen={menuOpen}
                toggleMenu={() => setMenuOpen((v) => !v)}
                closeMenu={() => setMenuOpen(false)}
                navSolid={true}
            />

            <main className="pt-28 pb-20">
                <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
                    {/* Header Section */}
                    <div className="bg-white rounded-3xl border border-surface-border overflow-hidden shadow-sm">
                        {/* Layer 1: Cover Section */}
                        <div className="h-40 w-full bg-gradient-to-br from-zinc-50 to-zinc-100/50 relative">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(117,192,67,0.05),transparent)]" />
                        </div>

                        {/* Identity & Intel Layer */}
                        <div className="px-6 pb-8 relative">
                            {/* Layer 2: Overlapping Avatar (Anchor) */}
                            <div className="absolute -top-18 left-6">
                                {profileImage ? (
                                    <div className="h-30 w-30 rounded-2xl border-4 border-white shadow-md bg-white overflow-hidden">
                                        <img src={profileImage} alt={displayName} className="h-full w-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="flex h-30 w-30 items-center justify-center rounded-2xl border-4 border-white bg-primary text-3xl font-bold text-white shadow-md uppercase">
                                        {initials}
                                    </div>
                                )}
                            </div>

                            {/* Layer 3: Intel Structure (Aligned to Avatar Left) */}
                            <div className="pt-16 flex flex-col gap-5">
                                {/* Row 1: Name + Actions */}
                                <div className="flex justify-between items-start">
                                    <h1 className="text-2xl font-bold tracking-tight text-surface-dark">{displayName}</h1>
                                    {isOwnProfile && (
                                        <Link
                                            to="/profile/edit"
                                            className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2 text-sm font-bold text-surface-dark transition hover:bg-zinc-50 hover:border-zinc-300"
                                        >
                                            <Edit2 size={16} className="text-primary" />
                                            <span>Edit Profile</span>
                                        </Link>
                                    )}
                                </div>

                                {/* Row 2: Username */}
                                <p className="text-sm font-medium text-surface-muted -mt-4">@{profile.username}</p>

                                {/* Row 3: Role & Degree */}
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200">
                                        <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">
                                            {profile.membership ? (profile.membership.role === 'representative' ? 'Representative' : 'Member') : 'Student'}
                                            {profile.membership?.community_name && ` • ${profile.membership.community_name}`}
                                        </span>
                                    </div>
                                    {profile.course && (
                                        <div className="flex items-center gap-2 text-surface-muted">
                                            <span className="h-1 w-1 rounded-full bg-zinc-300" />
                                            <span className="text-sm font-semibold">{profile.course.toUpperCase()}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Row 4: Bio */}
                                {profile.bio && (
                                    <p className="text-[15px] leading-relaxed text-surface-body max-w-2xl">
                                        {profile.bio}
                                    </p>
                                )}

                                {/* Row 5: Social Links */}
                                {(profile.linkedin_link || profile.github_link) && (
                                    <div className="flex items-center gap-4">
                                        {profile.linkedin_link && (
                                            <a href={profile.linkedin_link} target="_blank" rel="noopener noreferrer" className="text-[#0077b5] hover:text-[#0077b5]/80 transition-colors">
                                                <Linkedin size={20} />
                                            </a>
                                        )}
                                        {profile.github_link && (
                                            <a href={profile.github_link} target="_blank" rel="noopener noreferrer" className="text-black hover:text-black/80 transition-colors">
                                                <Github size={20} />
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="mt-8">
                        <div className="mb-8 flex items-center justify-between">
                            <h2 className="text-2xl font-display font-bold tracking-tight text-surface-dark">Recent Activity</h2>
                            <div className="h-px flex-1 mx-6 bg-oat" />
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {(activity.length > 0) ? (
                                activity.map((item, idx) => {
                                    if (item.type === 'announcement') return <div className="mb-6"><AnnouncementCard key={`ann-${item.id}`} item={item} /></div>
                                    if (item.type === 'discussion') return <div className="mb-6"><DiscussionCard key={`disc-${item.id}`} item={item} /></div>
                                    if (item.type === 'event') return <div className="mb-6"><EventCard key={`ev-${item.id}`} item={item} /></div>
                                    if (item.type === 'post') return <div className="mb-6"><PostCard key={`post-${item.id}`} post={item} onDelete={(id) => setPosts(prev => prev.filter(p => p.id !== id))} /></div>
                                    return null
                                })
                            ) : (
                                <div className="card-border border-dashed p-16 text-center bg-transparent">
                                    <p className="text-surface-body font-medium">No recent activity detected.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
