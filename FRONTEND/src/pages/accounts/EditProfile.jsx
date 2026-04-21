import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import apiClient from '../../services/apiClient'
import authService from '../../services/authService'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import Button from '../../components/shared/Button'

export default function EditProfile() {
    const navigate = useNavigate()
    const location = useLocation()
    const { id } = useParams() // Optional ID for community editing
    const { refreshUser, user: currentUser } = useAuth()
    const { showToast } = useToast()
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        role: '',
        course: '',
        bio: '',
        linkedin_link: '',
        github_link: '',
        interests: '',
        university_id: '',
        first_name: '',
        last_name: '',
        community_name: '',
        community_description: '',
        community_tag: ''
    })
    const [profileImage, setProfileImage] = useState(null)
    const [communityLogo, setCommunityLogo] = useState(null)
    const [previewUrl, setPreviewUrl] = useState('')

    const [loading, setLoading] = useState(true)
    const [menuOpen, setMenuOpen] = useState(false)
    const [submitLoading, setSubmitLoading] = useState(false)

    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '' })
    const [passwordLoading, setPasswordLoading] = useState(false)

    useEffect(() => {
        fetchProfile()
    }, [id])

    useEffect(() => {
        if (!loading && location.hash === '#change-password') {
            document.getElementById('change-password')?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [location.hash, loading])

    const fetchProfile = async () => {
        setLoading(true)
        try {
            const endpoint = id ? `/accounts/profile/${id}/` : '/accounts/profile/'
            const res = await apiClient.get(endpoint)
            const data = res.data
            setFormData({
                username: data.username || '',
                email: data.email || '',
                role: data.role || '',
                course: data.course || '',
                bio: data.bio || '',
                linkedin_link: data.linkedin_link || '',
                github_link: data.github_link || '',
                university_id: data.university_id || '',
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                community_name: data.community_name || '',
                community_description: data.community_description || '',
                community_tag: data.community_tag || '',
                interests: Array.isArray(data.interests) ? data.interests.join(', ') : (data.interests || '')
            })
            if (data.role === 'community' && data.community_logo) {
                setPreviewUrl(data.community_logo)
            } else if (data.profile_image) {
                setPreviewUrl(data.profile_image)
            }
        } catch (error) {
            console.error("Failed to load profile", error)
            showToast("Failed to load profile data.", "error")
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handlePasswordChange = (e) => {
        const { name, value } = e.target
        setPasswordData(prev => ({ ...prev, [name]: value }))
    }

    const handlePasswordSubmit = async (e) => {
        e.preventDefault()
        setPasswordLoading(true)
        try {
            await authService.changePassword(passwordData.oldPassword, passwordData.newPassword)
            showToast('Password changed successfully! Please use it on your next login.', 'success')
            setPasswordData({ oldPassword: '', newPassword: '' })
        } catch (error) {
            console.error("Change password failed", error)
            const errorMsg = error.response?.data?.old_password?.[0] || error.response?.data?.new_password?.[0] || 'Failed to change password.'
            showToast(errorMsg, 'error')
        } finally {
            setPasswordLoading(false)
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (formData.role === 'community') {
                setCommunityLogo(file)
            } else {
                setProfileImage(file)
            }
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitLoading(true)
        try {
            const data = new FormData()
            
            if (formData.role === 'community') {
                data.append('community_name', formData.community_name)
                data.append('community_description', formData.community_description)
                data.append('community_tag', formData.community_tag)
                if (communityLogo) data.append('community_logo', communityLogo)
            } else {
                data.append('first_name', formData.first_name)
                data.append('last_name', formData.last_name)
                data.append('course', formData.course)
                data.append('university_id', formData.university_id)
                if (profileImage) data.append('profile_image', profileImage)
            }
            
            data.append('bio', formData.bio)
            if (formData.linkedin_link) data.append('linkedin_link', formData.linkedin_link)
            if (formData.github_link) data.append('github_link', formData.github_link)
            
            const interestsArray = formData.interests.split(',').map(s => s.trim()).filter(Boolean)
            data.append('interests', JSON.stringify(interestsArray))

            const endpoint = id ? `/accounts/profile/${id}/` : '/accounts/profile/'
            await apiClient.patch(endpoint, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            
            // Refresh global user state if we are editing our own profile
            if (!id || id === currentUser?.id) {
                await refreshUser()
            }
            
            showToast('Profile updated successfully!', 'success')
            setTimeout(() => navigate(id ? `/community/${id}` : '/profile'), 1500)
        } catch (error) {
            console.error("Update failed", error.response?.data || error)
            const errorMsg = error.response?.data 
                ? Object.entries(error.response.data).map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`).join(' | ')
                : 'Failed to update profile.'
            showToast(errorMsg, 'error')
        } finally {
            setSubmitLoading(false)
        }
    }

    if (loading) return <div className="p-10">Loading...</div>

    return (
        <div className="min-h-screen bg-[#f4f5f2] text-[#0d1f14]">
            <Navbar
                menuOpen={menuOpen}
                toggleMenu={() => setMenuOpen((v) => !v)}
                closeMenu={() => setMenuOpen(false)}
                navSolid={true}
            />

            <main className="pt-24 pb-16">
                <div className="mx-auto w-full max-w-3xl px-4">
                    <header className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Edit Profile</h1>
                            <p className="text-[#4b4b4b]">Update your personal information</p>
                        </div>
                        <button
                            onClick={() => navigate(id ? `/community/${id}` : '/profile')}
                            className="text-sm font-semibold text-gray-500 hover:text-gray-700"
                        >
                            Cancel
                        </button>
                    </header>

                    <div className="rounded-3xl border border-[#e5e7eb] bg-white p-8 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Profile Image Section */}
                            <div className="flex flex-col items-center gap-4 border-b border-gray-100 pb-8">
                                <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-[#75C043] bg-gray-100 shadow-sm">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Profile Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-gray-400">
                                            NO IMAGE
                                        </div>
                                    )}
                                </div>
                                <label className="cursor-pointer rounded-xl bg-gray-50 px-4 py-2 text-xs font-bold text-[#0d1f14] transition hover:bg-gray-100 border border-gray-200">
                                    {formData.role === 'community' ? 'Change Logo' : 'Change Photo'}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                </label>
                            </div>
                            {/* Read Only Fields */}
                                {formData.role === 'community' ? (
                                    <>
                                        <div className="sm:col-span-2">
                                            <label className="mb-2 block text-sm font-bold">Community Name</label>
                                            <input
                                                type="text"
                                                name="community_name"
                                                value={formData.community_name}
                                                onChange={handleChange}
                                                className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 outline-none focus:border-[#75C043]"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="mb-2 block text-sm font-bold">Community Tagline</label>
                                            <input
                                                type="text"
                                                name="community_tag"
                                                value={formData.community_tag}
                                                onChange={handleChange}
                                                placeholder="e.g. Empowering students through technology"
                                                className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 outline-none focus:border-[#75C043]"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label className="mb-2 block text-sm font-bold">First Name</label>
                                            <input
                                                type="text"
                                                name="first_name"
                                                value={formData.first_name}
                                                onChange={handleChange}
                                                className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 outline-none focus:border-[#75C043]"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-bold">Last Name</label>
                                            <input
                                                type="text"
                                                name="last_name"
                                                value={formData.last_name}
                                                onChange={handleChange}
                                                className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 outline-none focus:border-[#75C043]"
                                            />
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="mb-2 block text-sm font-bold text-gray-500">Username</label>
                                    <input type="text" value={formData.username} readOnly className="w-full rounded-xl bg-gray-100 px-4 py-3 text-gray-500 outline-none" />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-gray-500">Email</label>
                                    <input type="text" value={formData.email} readOnly className="w-full rounded-xl bg-gray-100 px-4 py-3 text-gray-500 outline-none" />
                                </div>

                            {/* Editable Fields */}
                            {formData.role !== 'community' && (
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-bold">Course</label>
                                        <select
                                            name="course"
                                            value={formData.course}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 outline-none focus:border-[#75C043]"
                                        >
                                            <option value="">Select Course</option>
                                            <option value="bcs">Bachelor of Computer Science</option>
                                            <option value="bba">Bachelor of Business Administration</option>
                                            <option value="bibm">Bachelor in International Business Management</option>
                                            <option value="cybersecurity">Bachelor in Cyber Security</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-bold">University ID</label>
                                        <input
                                            type="text"
                                            name="university_id"
                                            value={formData.university_id}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 outline-none focus:border-[#75C043]"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="mb-2 block text-sm font-bold">{formData.role === 'community' ? 'Community Description' : 'Bio'}</label>
                                <textarea
                                    rows="4"
                                    name={formData.role === 'community' ? "community_description" : "bio"}
                                    value={formData.role === 'community' ? formData.community_description : formData.bio}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 outline-none focus:border-[#75C043] resize-none"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-bold">Interests <span className="text-xs font-normal text-gray-500">(comma separated)</span></label>
                                <input
                                    type="text"
                                    name="interests"
                                    value={formData.interests}
                                    onChange={handleChange}
                                    placeholder="e.g. AI, Web Dev, Music"
                                    className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 outline-none focus:border-[#75C043]"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-bold">LinkedIn URL</label>
                                    <input
                                        type="url"
                                        name="linkedin_link"
                                        value={formData.linkedin_link}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 outline-none focus:border-[#75C043]"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-bold">GitHub URL</label>
                                    <input
                                        type="url"
                                        name="github_link"
                                        value={formData.github_link}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 outline-none focus:border-[#75C043]"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => navigate(id ? `/community/${id}` : '/profile')}
                                    className="rounded-xl border border-gray-200 px-8 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <Button
                                    type="submit"
                                    isLoading={submitLoading}
                                    loadingText="Saving..."
                                    className="rounded-xl px-8 py-3 text-sm font-bold transition"
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </div>

                    <div id="change-password" className="mt-8 rounded-3xl border border-[#e5e7eb] bg-white p-8 shadow-sm">
                        <h2 className="mb-6 text-xl font-bold">Change Password</h2>
                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-bold">Current Password</label>
                                    <input
                                        type="password"
                                        name="oldPassword"
                                        value={passwordData.oldPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 outline-none focus:border-[#75C043]"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-bold">New Password</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        minLength={8}
                                        className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 outline-none focus:border-[#75C043]"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    isLoading={passwordLoading}
                                    loadingText="Changing..."
                                    className="rounded-xl px-8 py-3 text-sm font-bold transition"
                                >
                                    Change Password
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    )
}
