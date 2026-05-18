import { useParams, useNavigate } from 'react-router-dom'
import EditEventModal from '../components/EditEventModal'

/** Route wrapper so deep links to edit still open the modal. */
export default function EditEvent() {
  const { eventId } = useParams()
  const navigate = useNavigate()

  return (
    <EditEventModal
      isOpen
      eventId={eventId}
      onClose={() => navigate(-1)}
      onUpdated={() => navigate(`/events/${eventId}`)}
    />
  )
}
