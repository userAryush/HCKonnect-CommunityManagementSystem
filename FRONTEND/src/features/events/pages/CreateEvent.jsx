import { useParams, useNavigate } from 'react-router-dom'
import CreateEventModal from '../components/CreateEventModal'

export default function CreateEvent() {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <CreateEventModal
      isOpen
      communityId={id}
      onClose={() => navigate(`/community/${id}/dashboard`)}
      onCreated={() => navigate(`/community/${id}/dashboard`)}
    />
  )
}
