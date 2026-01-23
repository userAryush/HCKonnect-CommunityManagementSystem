import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../../components/Navbar'

export default function CreateAnnouncement() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [visibility, setVisibility] = useState('community')


  const handlePublish = () => {
    if (!title || !description) {
      setError('Please fill in all required fields.')
      return
    }
    // Logic to save announcement
    console.log('Publishing:', { title, description })
    navigate(`/community/${id}/dashboard`)
  }

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
            <h1 className="text-3xl font-bold">Create Announcement</h1>
            <p className="text-[#4b4b4b]">Share news and updates with your community</p>
          </header>

          <div className="rounded-3xl border border-[#e5e7eb] bg-white p-8 shadow-sm">
            {error && <div className="mb-4 rounded-xl bg-red-100 p-4 text-red-700">{error}</div>}

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
                <div className="flex h-32 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-[#e5e7eb] bg-[#f4f5f2] hover:bg-[#e5e7eb]">
                  <span className="text-sm font-medium text-[#4b4b4b]">Click to upload image</span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">Visibility</label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <label className={`flex flex-1 cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${visibility === 'community' ? 'border-[#75C043] bg-[#75C043]/10' : 'border-[#e5e7eb] bg-white hover:border-[#75C043]'}`}>
                    <input type="radio" name="visibility" value="community" checked={visibility === 'community'} onChange={(e) => setVisibility(e.target.value)} className="h-5 w-5 accent-[#75C043]" />
                    <div>
                      <span className="block font-bold text-[#0d1f14]">This Community Only</span>
                      <span className="text-xs text-[#4b4b4b]">Visible only to members</span>
                    </div>
                  </label>

                  <label className={`flex flex-1 cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${visibility === 'all' ? 'border-[#75C043] bg-[#75C043]/10' : 'border-[#e5e7eb] bg-white hover:border-[#75C043]'}`}>
                    <input type="radio" name="visibility" value="all" checked={visibility === 'all'} onChange={(e) => setVisibility(e.target.value)} className="h-5 w-5 accent-[#75C043]" />
                    <div>
                      <span className="block font-bold text-[#0d1f14]">All Communities</span>
                      <span className="text-xs text-[#4b4b4b]">Push to everyone's feed</span>
                    </div>
                  </label>

                  <label className={`flex flex-1 cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${visibility === 'public' ? 'border-[#75C043] bg-[#75C043]/10' : 'border-[#e5e7eb] bg-white hover:border-[#75C043]'}`}>
                    <input type="radio" name="visibility" value="public" checked={visibility === 'public'} onChange={(e) => setVisibility(e.target.value)} className="h-5 w-5 accent-[#75C043]" />
                    <div>
                      <span className="block font-bold text-[#0d1f14]">Public</span>
                      <span className="text-xs text-[#4b4b4b]">Visible to guests</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  onClick={handlePublish}
                  className="rounded-xl bg-[#75C043] px-8 py-3 text-sm font-bold text-[#0d1f14] transition hover:bg-[#68ae3b]"
                >
                  Publish Announcement
                </button>
                <button
                  onClick={() => navigate(`/community/${id}/dashboard`)}
                  className="rounded-xl border border-[#e5e7eb] bg-white px-8 py-3 text-sm font-bold text-[#0d1f14] transition hover:bg-[#f4f5f2]"
                >
                  Cancel
                </button>
                <button className="ml-auto text-sm font-semibold text-[#4b4b4b] hover:text-[#0d1f14]">
                  Save as Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
