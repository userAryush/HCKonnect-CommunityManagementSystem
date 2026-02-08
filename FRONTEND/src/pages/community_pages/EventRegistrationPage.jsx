import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'

export default function EventRegistrationPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    studentId: '',
    dietaryRestrictions: '',
    comments: ''
  })

  useEffect(() => {
    // Pre-fill user data if logged in
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setFormData(prev => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
        studentId: user.student_id || ''
      }));
    }

    const fetchEvent = async () => {
      try {
        const data = await import('../../services/eventService').then(m => m.default.getEvent(eventId));
        setEvent({
          ...data,
          eventMeta: {
            date: data.date,
            time: data.start_time,
            location: data.location
          }
        });
      } catch (error) {
        console.error("Failed to fetch event", error);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Mock submission logic - strictly speaking we'd need a backend endpoint
    console.log('Registered for event:', eventId, formData)
    alert("Registration Successful!");
    navigate(`/events/${eventId}`, { state: { success: 'Registered successfully!' } })
  }

  if (loading) return <div className="p-10 text-center">Loading event details...</div>
  if (!event) return <div className="p-10 text-center">Event not found.</div>

  return (
    <div className="min-h-screen bg-[#f4f5f2] text-[#0d1f14]">
      <Navbar navSolid={true} />

      <main className="mx-auto w-full max-w-2xl px-4 py-24">
        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-8 shadow-sm">
          <div className="mb-8 border-b border-[#f4f5f2] pb-6">
            <h1 className="mb-2 text-2xl font-bold">Register for {event.title}</h1>
            <p className="text-sm text-[#4b4b4b]">
              {event.eventMeta?.date} at {event.eventMeta?.time} <br />
              <span className="font-semibold">{event.eventMeta?.location}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-bold text-[#0d1f14]">Full Name</label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 text-sm outline-none focus:border-[#75C043]"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#0d1f14]">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 text-sm outline-none focus:border-[#75C043]"
                placeholder="john@university.edu"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#0d1f14]">Student ID</label>
              <input
                type="text"
                name="studentId"
                required
                value={formData.studentId}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 text-sm outline-none focus:border-[#75C043]"
                placeholder="12345678"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#0d1f14]">Dietary Restrictions (Optional)</label>
              <input
                type="text"
                name="dietaryRestrictions"
                value={formData.dietaryRestrictions}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 text-sm outline-none focus:border-[#75C043]"
                placeholder="None, Vegetarian, Gluten-free..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#0d1f14]">Additional Comments</label>
              <textarea
                name="comments"
                rows="3"
                value={formData.comments}
                onChange={handleChange}
                className="w-full resize-none rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 text-sm outline-none focus:border-[#75C043]"
                placeholder="Any questions or special requirements?"
              ></textarea>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full rounded-xl bg-[#75C043] py-4 text-sm font-bold text-[#0d1f14] shadow-lg shadow-[#75C043]/30 transition hover:bg-[#68ae3b] hover:shadow-xl"
              >
                Confirm Registration
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
