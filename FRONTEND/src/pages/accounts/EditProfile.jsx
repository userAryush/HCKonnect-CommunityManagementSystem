import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../services/api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function EditProfile() {
    const navigate = useNavigate()
    const { refreshUser } = useAuth()
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
        community_name: ''
    })
    const [profileImage, setProfileImage] = useState(null)
    const [previewUrl, setPreviewUrl] = useState('')

    const [loading, setLoading] = useState(true)
    const [menuOpen, setMenuOpen] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const res = await api.get('/accounts/profile/')
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
                interests: Array.isArray(data.interests) ? data.interests.join(', ') : (data.interests || '')
            })
            if (data.profile_image) {
                setPreviewUrl(data.profile_image)
            }
        } catch (error) {
            console.error("Failed to load profile", error)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setProfileImage(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMessage('')
        setLoading(true)
        try {
            const data = new FormData()
            // Removed data.append('username', formData.username) as it's read-only
            data.append('course', formData.course)
            data.append('bio', formData.bio)
            data.append('university_id', formData.university_id)
            if (formData.role !== 'community') {
                data.append('first_name', formData.first_name)
                data.append('last_name', formData.last_name)
            } else {
                data.append('community_name', formData.community_name)
            }
            
            if (formData.linkedin_link) data.append('linkedin_link', formData.linkedin_link)
            if (formData.github_link) data.append('github_link', formData.github_link)
            
            const interestsArray = formData.interests.split(',').map(s => s.trim()).filter(Boolean)
            // For JSONField in multipart/form-data, we send a JSON string
            data.append('interests', JSON.stringify(interestsArray))

            if (profileImage) {
                data.append('profile_image', profileImage)
            }

            await api.patch('/accounts/profile/', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            
            // Refresh global user state to update Navbar etc.
            await refreshUser()
            
            setMessage('Profile updated successfully!')
            setTimeout(() => navigate('/profile'), 1500)
        } catch (error) {
            console.error("Update failed", error.response?.data || error)
            const errorMsg = error.response?.data 
                ? Object.entries(error.response.data).map(([field, msgs]) => `${field}: ${msgs.join(', ')}`).join(' | ')
                : 'Failed to update profile.'
            setMessage(errorMsg)
        } finally {
            setLoading(false)
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
                            onClick={() => navigate('/profile')}
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
                                <label className="mb-2 block text-sm font-bold">Bio</label>
                                <textarea
                                    rows="3"
                                    name="bio"
                                    value={formData.bio}
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

                            {message && (
                                <div className={`p-4 rounded-xl ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {message}
                                </div>
                            )}

                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/profile')}
                                    className="rounded-xl border border-gray-200 px-8 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-xl bg-[#75C043] px-8 py-3 text-sm font-bold text-[#0d1f14] transition hover:bg-[#68ae3b]"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    )
}
