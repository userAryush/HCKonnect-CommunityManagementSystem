import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext' // Use Auth context
import eventService from '../../services/eventService'
import Button from '../../components/shared/Button' // Import Button
import { useToast } from '../../context/ToastContext'

export default function EventRegistrationPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth() // Get user from context
  const { showToast } = useToast()

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    course: '',
    semester: '',
    studentId: '',
    comments: ''
  })

  useEffect(() => {
    // Pre-fill user data from auth context
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        email: user.email || '',
        course: user.course || '',
        studentId: user.student_id || ''
      }));
    };

    const fetchEvent = async () => {
      try {
        const data = await eventService.getEvent(eventId);
        setEvent(data);
      } catch (error) {
        console.error("Failed to fetch event", error);
        showToast("Failed to load event details.", "error");
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId, user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // The backend expects a simple registration, but we can pass extra data if the endpoint supports it.
      // For now, we'll just call the registration endpoint.
      // The extra form data is collected but not sent unless the backend is updated.
      await eventService.registerForEvent(eventId, {
        // You can pass formData here if your backend endpoint accepts it
        // e.g., registration_details: formData 
      });
      showToast("Registration Successful!", "success");
      navigate(`/events/${eventId}`, { replace: true })
    } catch (error) {
      const errorMsg = error.response?.data?.detail || "Registration failed. Please try again.";
      showToast(errorMsg, "error");
      console.error('Registration failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <div className="p-10 text-center">Loading event details...</div>
  if (!event) return <div className="p-10 text-center">Event not found.</div>

  return (
    <div className="min-h-screen bg-secondary text-[#0d1f14]">
      <Navbar navSolid={true} />

      <main className="mx-auto w-full max-w-2xl px-4 py-24">
        <button
          onClick={() => navigate(`/events/${eventId}`)}
          className="inline-flex items-center text-sm font-medium text-[#4b4b4b] hover:text-[#0d1f14] transition-colors mb-6 gap-1"
        >
          ← Back to Event
        </button>
        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-8 shadow-sm">
          <div className="mb-8 border-b border-[#f4f5f2] pb-6">
            <h1 className="mb-2 text-2xl font-bold">Register for {event.title}</h1>
            <p className="text-sm text-[#4b4b4b]">
              {event.date} at {event.start_time} <br />
              <span className="font-semibold">{event.location}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form fields remain largely the same, just add new ones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="mb-2 block text-sm font-bold text-[#0d1f14]">Full Name</label>
                <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 text-sm outline-none focus:border-[#75C043]" placeholder="John Doe" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-[#0d1f14]">Email Address</label>
                <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 text-sm outline-none focus:border-[#75C043]" placeholder="john@university.edu" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="mb-2 block text-sm font-bold text-[#0d1f14]">Course</label>
                <input type="text" name="course" required value={formData.course} onChange={handleChange} className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 text-sm outline-none focus:border-[#75C043]" placeholder="e.g. B.Tech CSE" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-[#0d1f14]">Semester</label>
                <input type="number" name="semester" required value={formData.semester} onChange={handleChange} className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 text-sm outline-none focus:border-[#75C043]" placeholder="e.g. 6" min="1" max="8" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-[#0d1f14]">Student ID</label>
                <input type="text" name="studentId" required value={formData.studentId} onChange={handleChange} className="w-full rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 text-sm outline-none focus:border-[#75C043]" placeholder="12345678" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#0d1f14]">Additional Comments (Optional)</label>
              <textarea name="comments" rows="3" value={formData.comments} onChange={handleChange} className="w-full resize-none rounded-xl border border-[#e5e7eb] bg-[#f4f5f2] px-4 py-3 text-sm outline-none focus:border-[#75C043]" placeholder="Any questions or special requirements?"></textarea>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                isLoading={isSubmitting}
                loadingText="Confirming..."
                className="w-full !rounded-xl !py-4 !text-sm !font-bold"
              >
                Confirm Registration
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
