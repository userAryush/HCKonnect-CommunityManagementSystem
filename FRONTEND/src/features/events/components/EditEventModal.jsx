import { useEffect, useState } from 'react'
import ModalWrapper from '../../../shared/components/modals/ModalWrapper'
import ModalHeader from '../../../shared/components/modals/ModalHeader'
import EventForm from './shared/EventForm'
import eventService from '../service/eventService'
import { useToast } from '../../../shared/components/ui/ToastContext'
import getApiErrorMessage from '../../../utils/getApiErrorMessage'

const initialForm = {
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
  what_to_expect: [],
}

export default function EditEventModal({ isOpen, onClose, eventId, onUpdated }) {
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingEvent, setIsLoadingEvent] = useState(false)
  const [formData, setFormData] = useState(initialForm)

  useEffect(() => {
    if (!isOpen || !eventId) {
      setFormData(initialForm)
      setIsSubmitting(false)
      setIsLoadingEvent(false)
      return
    }

    let isMounted = true
    setIsLoadingEvent(true)

    eventService
      .getEvent(eventId)
      .then((data) => {
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
          what_to_expect: data.what_to_expect || [],
        })
      })
      .catch((err) => {
        console.error('Failed to load event for edit', err)
        showToast('Failed to load event data.', 'error')
        onClose()
      })
      .finally(() => {
        if (isMounted) setIsLoadingEvent(false)
      })

    return () => {
      isMounted = false
    }
  }, [isOpen, eventId, onClose, showToast])

  const handleSubmit = async () => {
    if (isSubmitting || !eventId) return
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
      showToast('Event updated successfully.', 'success')
      if (onUpdated) onUpdated()
      onClose()
    } catch (e) {
      console.error('Failed to update event', e)
      const errorMsg =
        e.response && e.response.data
          ? typeof e.response.data === 'object'
            ? Object.entries(e.response.data)
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ')
            : e.response.data
          : getApiErrorMessage(e, 'Failed to update event. Please try again.')
      showToast(`Error: ${errorMsg}`, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} className="max-w-6xl">
      <ModalHeader
        title="Edit event"
        subtitle="Update the details for your event."
        onClose={onClose}
      />

      <div className="max-h-[min(70vh,calc(100vh-10rem))] overflow-y-auto p-6 sm:p-8">
        <EventForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
          isLoading={isLoadingEvent}
          submitText="Update Event"
          loadingText="Updating..."
          showEventAi
          layoutVariant="modal"
        />
      </div>
    </ModalWrapper>
  )
}
