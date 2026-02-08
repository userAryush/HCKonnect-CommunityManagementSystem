import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import eventService from '../../services/eventService'
import { Plus, Trash2, Calendar, Clock, MapPin, Upload, Loader2 } from 'lucide-react'
import Toast from '../../components/others/Toast'


export default function CreateEvent() {
  const { id, eventId } = useParams()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const isEditMode = !!eventId;
  const [toast, setToast] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    format: 'On-site',
    image: null,
    speakers: [], // Array of {name, profession}
    what_to_expect: [] // Array of strings
  })
  const [speakerInput, setSpeakerInput] = useState({ name: '', profession: '' })
  const [w2eInput, setW2eInput] = useState('')
  try {
    // Fetch event data if in edit mode
    useState(() => {
      if (isEditMode) {
        eventService.getEvent(eventId).then(data => {
          setFormData({
            title: data.title,
            description: data.description,
            date: data.date,
            start_time: data.start_time,
            end_time: data.end_time || '',
            location: data.location,
            format: data.format,
            image: null, // Keep null, if they want to update they upload new one
            speakers: data.speakers || [],
            what_to_expect: data.what_to_expect || []
          })
        }).catch(err => console.error("Failed to load event for edit", err));
      }
    }, [eventId]);

    const handleInputChange = (e) => {
      const { name, value } = e.target
      setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleFileChange = (e) => {
      setFormData(prev => ({ ...prev, image: e.target.files[0] }))
    }

    const addSpeaker = () => {
      if (speakerInput.name && speakerInput.profession) {
        setFormData(prev => ({ ...prev, speakers: [...prev.speakers, speakerInput] }))
        setSpeakerInput({ name: '', profession: '' })
      }
    }

    const removeSpeaker = (index) => {
      setFormData(prev => ({ ...prev, speakers: prev.speakers.filter((_, i) => i !== index) }))
    }

    const addW2E = () => {
      if (w2eInput.trim()) {
        setFormData(prev => ({ ...prev, what_to_expect: [...prev.what_to_expect, w2eInput] }))
        setW2eInput('')
      }
    }

    const removeW2E = (index) => {
      setFormData(prev => ({ ...prev, what_to_expect: prev.what_to_expect.filter((_, i) => i !== index) }))
    }

    const handleSubmit = async () => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      try {
        // Calculate default end time if not provided
        // Calculate default end time if not provided
        let finalEndTime = formData.end_time;

        // If end_time is missing OR equal/less than start_time (simple string comparison for HH:MM works for same day)
        // Note: this simple check assumes same day. Ideally use Date objects.
        if (!finalEndTime || (finalEndTime <= formData.start_time && formData.date)) {
          if (formData.start_time) {
            const [hours, minutes] = formData.start_time.split(':').map(Number);
            const date = new Date();
            date.setHours(hours + 1);
            date.setMinutes(minutes);
            finalEndTime = date.toTimeString().slice(0, 5);
          }
        }

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('date', formData.date);
        data.append('start_time', formData.start_time);
        data.append('end_time', finalEndTime || formData.start_time);
        data.append('location', formData.location);
        data.append('format', formData.format === 'In-person' ? 'On-site' : formData.format);

        if (formData.image) {
          data.append('image', formData.image);
        }

        // Append complex fields as JSON strings
        data.append('speakers', JSON.stringify(formData.speakers));
        data.append('what_to_expect', JSON.stringify(formData.what_to_expect));
        // Community ID is handled by backend from user context or we might need to pass it if admin
        if (id) data.append('community', id);

        if (isEditMode) {
          await eventService.updateEvent(eventId, data);
          navigate(`/events/${eventId}`, { state: { success: 'Event updated successfully!' } });
        } else {
          await eventService.createEvent(data);
          navigate(`/community/${id}/dashboard`, { state: { success: 'Event created successfully!' } });
        }
      } catch (e) {
        console.error("Failed to save event", e);
        if (e.response && e.response.data) {
          console.log("Validation Errors:", e.response.data);
          // Try to stringify error for display if it's an object
          const errorMsg = typeof e.response.data === 'object'
            ? Object.entries(e.response.data).map(([k, v]) => `${k}: ${v}`).join(', ')
            : e.response.data;
          setToast(`Error: ${errorMsg}`);
        } else {
          setToast(`Failed to ${isEditMode ? 'update' : 'create'} event. Please try again.`);
        }
      }
    }
  } finally {
    setIsSubmitting(false);
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
        <div className="mx-auto w-full max-w-5xl px-4">
          <header className="mb-8">
            <h1 className="text-3xl font-bold">{isEditMode ? 'Edit Event' : 'Create Event'}</h1>
            <p className="text-[#4b4b4b]">{isEditMode ? 'Update event details' : 'Plan and organize your next community event'}</p>
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

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                      <label className="mb-2 block text-sm font-bold">Start Time <span className="text-red-500">*</span></label>
                      <input
                        type="time"
                        name="start_time"
                        value={formData.start_time}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 outline-none focus:border-[#75C043]"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold">End Time</label>
                      <input
                        type="time"
                        name="end_time"
                        value={formData.end_time}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 outline-none focus:border-[#75C043]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold">Location <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 outline-none focus:border-[#75C043]"
                      placeholder="e.g. LS 101 or Zoom Link"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-bold">Format</label>
                      <select
                        name="format"
                        value={formData.format}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 outline-none focus:border-[#75C043]"
                      >
                        <option value="On-site">On-site</option>
                        <option value="Online">Online</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold">Event Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-2 text-sm outline-none focus:border-[#75C043]"
                      />
                    </div>
                  </div>

                  {/* Speakers Section */}
                  <div>
                    <label className="mb-2 block text-sm font-bold flex justify-between">
                      Speakers
                      <span className="text-xs font-normal text-gray-500">Optional</span>
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        placeholder="Name"
                        value={speakerInput.name}
                        onChange={e => setSpeakerInput(prev => ({ ...prev, name: e.target.value }))}
                        className="flex-1 rounded-xl border border-[#e5e7eb] px-3 py-2 text-sm"
                      />
                      <input
                        placeholder="Profession"
                        value={speakerInput.profession}
                        onChange={e => setSpeakerInput(prev => ({ ...prev, profession: e.target.value }))}
                        className="flex-1 rounded-xl border border-[#e5e7eb] px-3 py-2 text-sm"
                      />
                      <button type="button" onClick={addSpeaker} className="bg-[#0d1f14] text-white px-4 rounded-xl text-sm font-bold">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.speakers.map((s, idx) => (
                        <div key={idx} className="bg-gray-100 rounded-lg px-3 py-1 text-sm flex items-center gap-2">
                          <span className="font-bold">{s.name}</span>
                          <span className="text-xs text-gray-500">({s.profession})</span>
                          <button type="button" onClick={() => removeSpeaker(idx)} className="text-red-500 hover:text-red-700">×</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* What to Expect Section */}
                  <div>
                    <label className="mb-2 block text-sm font-bold flex justify-between">
                      What to Expect
                      <span className="text-xs font-normal text-gray-500">Optional - Bullet points</span>
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        placeholder="e.g. Free swag, Networking..."
                        value={w2eInput}
                        onChange={e => setW2eInput(e.target.value)}
                        className="flex-1 rounded-xl border border-[#e5e7eb] px-3 py-2 text-sm"
                      />
                      <button type="button" onClick={addW2E} className="bg-[#0d1f14] text-white px-4 rounded-xl text-sm font-bold">Add</button>
                    </div>
                    <ul className="list-disc pl-5 text-sm text-gray-600">
                      {formData.what_to_expect.map((item, idx) => (
                        <li key={idx} className="group">
                          {item}
                          <button type="button" onClick={() => removeW2E(idx)} className="ml-2 text-red-500 opacity-0 group-hover:opacity-100">remove</button>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-[#75C043] px-8 py-3 text-sm font-bold text-[#0d1f14] transition hover:bg-[#68ae3b] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting
                    ? (isEditMode ? 'Updating...' : 'Creating...')
                    : (isEditMode ? 'Update Event' : 'Create Event')
                  }
                </button>
                <button
                  onClick={() => navigate(`/community/${id}/dashboard`)}
                  className="rounded-xl border border-[#e5e7eb] bg-white px-8 py-3 text-sm font-bold text-[#0d1f14] transition hover:bg-[#f4f5f2]"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Preview Section */}
            <aside>
              <div className="sticky top-24">
                <h2 className="mb-6 text-xl font-bold">Preview</h2>
                <div className="rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
                  <div className="mb-4 border-b border-[#f4f5f2] pb-4">
                    <h3 className="font-bold text-lg">{formData.title || 'Event Title'}</h3>
                    <p className="text-sm text-[#4b4b4b] mt-1">
                      {formData.date ? new Date(formData.date).toDateString() : 'Date'} • {formData.start_time || 'Time'}
                    </p>
                    <p className="text-sm text-[#4b4b4b]">{formData.location || 'Location'}</p>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-sm">
                    <div className="h-48 bg-gray-200 object-cover">
                      {formData.image ?
                        <img src={URL.createObjectURL(formData.image)} className="w-full h-full object-cover" /> :
                        <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                      }
                    </div>
                    <div className="p-4">
                      <p className="text-xs font-bold uppercase text-[#75C043]">{formData.date || 'Date'} • {formData.start_time || 'Time'}</p>
                      <h3 className="mt-1 text-lg font-bold text-[#0d1f14]">{formData.title || 'Event Title'}</h3>
                      <p className="mt-1 text-sm text-[#4b4b4b]">{formData.location || 'Location'}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-center text-[#4b4b4b]">
                    This is how your event card will appear to students.
                  </p>

                  <div className="space-y-4 opacity-70 pointer-events-none mt-8">
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
