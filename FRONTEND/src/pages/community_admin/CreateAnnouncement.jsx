import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import announcementService from '../../services/announcementService'
import Toast from '../../components/others/Toast'
import { Loader2 } from 'lucide-react'

export default function CreateAnnouncement() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState('private')
  const [image, setImage] = useState(null)

  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')


  const handlePublish = async () => {
    if (!title || !description) {
      setToast('Please fill in all required fields.')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('visibility', visibility)
      if (image) {
        formData.append('image', image)
      }

      // Backend handles logic to associate with community/user
      await announcementService.createAnnouncement(formData)

      navigate(`/community/${id}/dashboard`, { state: { success: 'Announcement posted successfully!' } })
    } catch (error) {
      console.error("Failed to create announcement", error)
      setToast('Failed to create announcement. ' + (error.response?.data?.detail || ''))
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0])
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f5f2] text-[#0d1f14]">
      <Navbar
        menuOpen={menuOpen}
        toggleMenu={() => setMenuOpen((v) => !v)}
        closeMenu={() => setMenuOpen(false)}
        navSolid={true}
      />
      <Toast message={toast} onClose={() => setToast('')} />

      <main className="pt-24 pb-16">
        <div className="mx-auto w-full max-w-3xl px-4">
          <header className="mb-8">
            <h1 className="text-3xl font-bold">Create Announcement</h1>
            <p className="text-[#4b4b4b]">Share news and updates with your community</p>
          </header>

          <div className="rounded-3xl border border-[#e5e7eb] bg-white p-8 shadow-sm">

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-bold">Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 outline-none focus:border-[#75C043]"
                  placeholder="e.g. Club Fair Schedule Change"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">Description <span className="text-red-500">*</span></label>
                <textarea
                  rows="6"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 outline-none focus:border-[#75C043] resize-none"
                  placeholder="Write your announcement here..."
                ></textarea>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">Image (Optional)</label>
                <div className="relative flex h-32 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-[#e5e7eb] bg-[#f4f5f2] hover:bg-[#e5e7eb]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {image ? (
                    <span className="text-sm font-semibold text-[#75C043]">{image.name}</span>
                  ) : (
                    <span className="text-sm font-medium text-[#4b4b4b]">Click to upload image</span>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">Visibility</label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <label className={`flex flex-1 cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${visibility === 'private' ? 'border-[#75C043] bg-[#75C043]/10' : 'border-[#e5e7eb] bg-white hover:border-[#75C043]'}`}>
                    <input type="radio" name="visibility" value="private" checked={visibility === 'private'} onChange={(e) => setVisibility(e.target.value)} className="h-5 w-5 accent-[#75C043]" />
                    <div>
                      <span className="block font-bold text-[#0d1f14]">Private (Community Only)</span>
                      <span className="text-xs text-[#4b4b4b]">Visible only to own members</span>
                    </div>
                  </label>



                  <label className={`flex flex-1 cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${visibility === 'public' ? 'border-[#75C043] bg-[#75C043]/10' : 'border-[#e5e7eb] bg-white hover:border-[#75C043]'}`}>
                    <input type="radio" name="visibility" value="public" checked={visibility === 'public'} onChange={(e) => setVisibility(e.target.value)} className="h-5 w-5 accent-[#75C043]" />
                    <div>
                      <span className="block font-bold text-[#0d1f14]">Public</span>
                      <span className="text-xs text-[#4b4b4b]">Visible to everyone</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  onClick={handlePublish}
                  disabled={loading}
                  className={`flex items-center gap-2 rounded-xl bg-[#75C043] px-8 py-3 text-sm font-bold text-[#0d1f14] transition hover:bg-[#68ae3b] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? 'Publishing...' : 'Publish Announcement'}
                </button>
                <button
                  onClick={() => navigate(`/community/${id}/dashboard`)}
                  className="rounded-xl border border-[#e5e7eb] bg-white px-8 py-3 text-sm font-bold text-[#0d1f14] transition hover:bg-[#f4f5f2]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
