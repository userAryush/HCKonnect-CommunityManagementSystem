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
        ...(profile.posted_content || []).map(item => ({ ...item, isLegacy: true })),
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
                <div className="mx-auto w-full max-w-4xl px-6">
                    {/* Header Card */}
                    <div className="card-border p-0 overflow-hidden shadow-sm">
                        {/* Cover Image */}
                        <div className="h-48 w-full bg-oat/50 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-surface-border" />
                        </div>

                        <div className="relative px-8 pb-8">
                            {/* Profile Image */}
                            <div className="absolute -top-20 left-10">
                                {profileImage ? (
                                    <div className="h-40 w-40 rounded-2xl border-4 border-surface shadow-xl bg-surface overflow-hidden">
                                        <img
                                            src={profileImage}
                                            alt={displayName}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex h-40 w-40 items-center justify-center rounded-2xl border-4 border-surface bg-primary text-5xl font-bold text-white shadow-xl uppercase">
                                        {initials}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end pt-6 pr-2">
                                {isOwnProfile && (
                                    <Link
                                        to="/profile/edit"
                                        className="flex items-center gap-2 rounded-button border border-surface-border bg-white px-6 py-2.5 text-sm font-bold text-surface-dark transition hover:bg-secondary hover:border-primary/30"
                                    >
                                        <Edit2 size={16} className="text-primary" />
                                        Edit Profile
                                    </Link>
                                )}
                            </div>

                            {/* Name and Info */}
                            <div className="mt-8 px-2">
                                <h1 className="text-4xl font-display font-bold tracking-tight text-surface-dark">{displayName}</h1>
                                <p className="text-surface-body font-medium mt-1">@{profile.username}</p>

                                <div className="mt-6 flex flex-wrap items-center gap-6">
                                    {profile.membership ? (
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                                            <Award size={16} className="text-primary" />
                                            <span className="text-xs font-bold text-primary uppercase tracking-wider">
                                                {profile.membership.role === 'representative' ? 'Representative' : 'Member'} • {profile.membership.community_name}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-oat/40 border border-surface-border text-surface-body">
                                            <Award size={16} />
                                            <span className="text-xs font-bold uppercase tracking-wider">Student</span>
                                        </div>
                                    )}

                                    {profile.course && (
                                        <div className="flex items-center gap-2 text-surface-body">
                                            <Globe size={18} />
                                            <span className="text-sm font-medium">{profile.course.toUpperCase()}</span>
                                        </div>
                                    )}
                                </div>

                                {profile.bio && (
                                    <p className="mt-8 max-w-2xl text-[15px] leading-relaxed text-surface-dark/80 bg-secondary/30 p-4 rounded-xl border border-surface-border/50">
                                        {profile.bio}
                                    </p>
                                )}

                                {/* Links */}
                                <div className="mt-8 flex gap-4">
                                    {profile.linkedin_link && (
                                        <a href={profile.linkedin_link} target="_blank" rel="noopener noreferrer" className="h-10 w-10 flex items-center justify-center rounded-lg border border-surface-border bg-white text-surface-body hover:text-primary hover:border-primary/30 transition-all shadow-sm">
                                            <Linkedin size={20} />
                                        </a>
                                    )}
                                    {profile.github_link && (
                                        <a href={profile.github_link} target="_blank" rel="noopener noreferrer" className="h-10 w-10 flex items-center justify-center rounded-lg border border-surface-border bg-white text-surface-body hover:text-surface-dark hover:border-surface-body transition-all shadow-sm">
                                            <Github size={20} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="mt-16">
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
