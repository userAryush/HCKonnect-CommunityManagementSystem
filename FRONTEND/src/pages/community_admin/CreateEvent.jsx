import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../../components/Navbar'

export default function CreateEvent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeStep, setActiveStep] = useState(1)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    format: 'In-person',
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCreate = () => {
    console.log('Creating Event:', formData)
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
        <div className="mx-auto w-full max-w-5xl px-4">
          <header className="mb-8">
            <h1 className="text-3xl font-bold">Create Event</h1>
            <p className="text-[#4b4b4b]">Plan and organize your next community event</p>
          </header>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
             {/* Form Section */}
             <div className="lg:col-span-2 space-y-8">
                <div className="rounded-3xl border border-[#e5e7eb] bg-white p-8 shadow-sm">
                   <h2 className="mb-6 text-xl font-bold">Event Details</h2>
                   <div className="space-y-6">
                      <div>
                        <label className="mb-2 block text-sm font-bold">Event Title <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 outline-none focus:border-[#75C043]" 
                          placeholder="e.g. Intro to React Workshop"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-bold">Description <span className="text-red-500">*</span></label>
                        <textarea 
                          rows="4" 
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 outline-none focus:border-[#75C043] resize-none"
                          placeholder="Describe your event..."
                        ></textarea>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                         <div>
                            <label className="mb-2 block text-sm font-bold">Date <span className="text-red-500">*</span></label>
                            <input 
                              type="date" 
                              name="date"
                              value={formData.date}
                              onChange={handleInputChange}
                              className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 outline-none focus:border-[#75C043]" 
                            />
                         </div>
                         <div>
                            <label className="mb-2 block text-sm font-bold">Time <span className="text-red-500">*</span></label>
                            <input 
                              type="time" 
                              name="time"
                              value={formData.time}
                              onChange={handleInputChange}
                              className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 outline-none focus:border-[#75C043]" 
                            />
                         </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                         <div>
                            <label className="mb-2 block text-sm font-bold">Location <span className="text-red-500">*</span></label>
                            <input 
                              type="text" 
                              name="location"
                              value={formData.location}
                              onChange={handleInputChange}
                              className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 outline-none focus:border-[#75C043]" 
                              placeholder="e.g. Room 304 / Zoom Link"
                            />
                         </div>
                         <div>
                            <label className="mb-2 block text-sm font-bold">Format</label>
                            <select 
                              name="format"
                              value={formData.format}
                              onChange={handleInputChange}
                              className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 outline-none focus:border-[#75C043]"
                            >
                               <option value="In-person">In-person</option>
                               <option value="Online">Online</option>
                               <option value="Hybrid">Hybrid</option>
                            </select>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                      onClick={handleCreate}
                      className="rounded-xl bg-[#75C043] px-8 py-3 text-sm font-bold text-[#0d1f14] transition hover:bg-[#68ae3b]"
                    >
                      Create Event
                    </button>
                    <button 
                      onClick={() => navigate(`/community/${id}/dashboard`)}
                      className="rounded-xl border border-[#e5e7eb] bg-white px-8 py-3 text-sm font-bold text-[#0d1f14] transition hover:bg-[#f4f5f2]"
                    >
                      Cancel
                    </button>
                </div>
             </div>

             {/* Registration Preview */}
             <aside>
                <div className="sticky top-24">
                   <h2 className="mb-6 text-xl font-bold">Registration Preview</h2>
                   <div className="rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
                      <div className="mb-4 border-b border-[#f4f5f2] pb-4">
                         <h3 className="font-bold text-lg">{formData.title || 'Event Title'}</h3>
                         <p className="text-sm text-[#4b4b4b] mt-1">
                            {formData.date ? new Date(formData.date).toDateString() : 'Date'} • {formData.time || 'Time'}
                         </p>
                         <p className="text-sm text-[#4b4b4b]">{formData.location || 'Location'}</p>
                      </div>

                      <div className="space-y-4 opacity-70 pointer-events-none">
                         <p className="text-xs font-bold uppercase text-[#75C043]">Registration Form</p>
                         <input type="text" placeholder="Full Name" className="w-full rounded-lg border border-[#e5e7eb] bg-[#f4f5f2] px-3 py-2 text-sm" />
                         <input type="email" placeholder="Email Address" className="w-full rounded-lg border border-[#e5e7eb] bg-[#f4f5f2] px-3 py-2 text-sm" />
                         <div className="grid grid-cols-2 gap-2">
                             <input type="text" placeholder="Year" className="w-full rounded-lg border border-[#e5e7eb] bg-[#f4f5f2] px-3 py-2 text-sm" />
                             <input type="text" placeholder="Department" className="w-full rounded-lg border border-[#e5e7eb] bg-[#f4f5f2] px-3 py-2 text-sm" />
                         </div>
                         <label className="flex items-center gap-2 text-xs text-[#4b4b4b]">
                            <input type="checkbox" className="rounded border-gray-300" />
                            I agree to the terms and conditions
                         </label>
                         <button className="w-full rounded-lg bg-[#0d1f14] py-2 text-sm font-bold text-white">Register</button>
                      </div>
                   </div>
                </div>
             </aside>
          </div>
        </div>
      </main>
    </div>
  )
}
