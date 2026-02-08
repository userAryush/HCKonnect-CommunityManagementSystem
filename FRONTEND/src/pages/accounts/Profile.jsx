import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../services/api'

export default function Profile() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        role: '',
        course: '',
        bio: '',
        linkedin_link: '',
        github_link: '',
        interests: '',
        university_id: ''
    })

    // We keep interests as string for editing, convert to array on save
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
                interests: Array.isArray(data.interests) ? data.interests.join(', ') : (data.interests || '')
            })
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

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMessage('')
        try {
            const payload = {
                ...formData,
                interests: formData.interests.split(',').map(s => s.trim()).filter(Boolean)
            }
            // Remove readonly fields from payload just in case, though backend ignores them usually if check read_only_fields
            // But PUT/PATCH to a serializer with read_only_fields ignores them safely.

            await api.patch('/accounts/profile/', payload)
            setMessage('Profile updated successfully!')
        } catch (error) {
            console.error("Update failed", error)
            setMessage('Failed to update profile.')
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
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold">My Profile</h1>
                        <p className="text-[#4b4b4b]">Manage your personal information</p>
                    </header>

                    <div className="rounded-3xl border border-[#e5e7eb] bg-white p-8 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Read Only Fields */}
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-gray-500">Username</label>
                                    <input type="text" value={formData.username} readOnly className="w-full rounded-xl bg-gray-100 px-4 py-3 text-gray-500 outline-none" />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-gray-500">Email</label>
                                    <input type="text" value={formData.email} readOnly className="w-full rounded-xl bg-gray-100 px-4 py-3 text-gray-500 outline-none" />
                                </div>
                            </div>

                            {/* Editable Fields */}
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

                            <div className="flex justify-end">
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
