import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../../../shared/components/layout/Navbar'
import eventService from '../service/eventService'
import { useToast } from '../../../shared/components/ui/ToastContext'
import EventForm from '../components/shared/EventForm'

export default function EditEvent() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingEvent, setIsLoadingEvent] = useState(true)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    format: 'On-site',
    image: null,
    max_participants: '',
    speakers: [],
    what_to_expect: []
  })

  useEffect(() => {
    let isMounted = true
    setIsLoadingEvent(true)

    eventService.getEvent(eventId).then((data) => {
      if (!isMounted) return
      setFormData({
        title: data.title,
        description: data.description,
        date: data.date,
        start_time: data.start_time,
        end_time: data.end_time || '',
        location: data.location,
        format: data.format,
        image: null,
        max_participants: data.max_participants || '',
        speakers: data.speakers || [],
        what_to_expect: data.what_to_expect || []
      })
    }).catch((err) => {
      console.error('Failed to load event for edit', err)
      showToast('Failed to load event data.', 'error')
    }).finally(() => {
      if (isMounted) setIsLoadingEvent(false)
    })

    return () => {
      isMounted = false
    }
  }, [eventId, showToast])

  const handleSubmit = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      let finalEndTime = formData.end_time

      if (!finalEndTime || (finalEndTime <= formData.start_time && formData.date)) {
        if (formData.start_time) {
          const [hours, minutes] = formData.start_time.split(':').map(Number)
          const date = new Date()
          date.setHours(hours + 1)
          date.setMinutes(minutes)
          finalEndTime = date.toTimeString().slice(0, 5)
        }
      }

      const data = new FormData()
      data.append('title', formData.title)
      data.append('description', formData.description)
      data.append('date', formData.date)
      data.append('start_time', formData.start_time)
      data.append('end_time', finalEndTime || formData.start_time)
      data.append('location', formData.location)
      data.append('format', formData.format === 'In-person' ? 'On-site' : formData.format)

      if (formData.max_participants) {
        data.append('max_participants', formData.max_participants)
      }

      if (formData.image) {
        data.append('image', formData.image)
      }

      data.append('speakers', JSON.stringify(formData.speakers))
      data.append('what_to_expect', JSON.stringify(formData.what_to_expect))

      await eventService.updateEvent(eventId, data)
      showToast('Event updated successfully!', 'success')
      navigate(`/events/${eventId}`)
    } catch (e) {
      console.error('Failed to update event', e)
      if (e.response && e.response.data) {
        const errorMsg = typeof e.response.data === 'object'
          ? Object.entries(e.response.data).map(([k, v]) => `${k}: ${v}`).join(', ')
          : e.response.data
        showToast(`Error: ${errorMsg}`, 'error')
      } else {
        showToast('Failed to update event. Please try again.', 'error')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary text-[#0d1f14]">
      <Navbar
        menuOpen={menuOpen}
        toggleMenu={() => setMenuOpen((v) => !v)}
        closeMenu={() => setMenuOpen(false)}
        navSolid={true}
      />

      <main className="pt-24 pb-16">
        <div className="mx-auto w-full max-w-4xl px-4">
          <header className="mb-12 text-center">
            <h1 className="text-4xl font-black tracking-tight text-zinc-900">Edit Event</h1>
            <p className="mt-2 text-zinc-500">Update the details for your event.</p>
          </header>

          <EventForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onCancel={() => navigate(-1)}
            isSubmitting={isSubmitting}
            isLoading={isLoadingEvent}
            submitText="Update Event"
            loadingText="Updating..."
          />
        </div>
      </main>
    </div>
  )
}
