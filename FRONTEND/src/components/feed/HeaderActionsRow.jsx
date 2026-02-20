import { useNavigate } from 'react-router-dom'
import { PenLine, MessageSquarePlus, PlusCircle } from 'lucide-react'

export default function HeaderActionsRow() {
  const navigate = useNavigate()

  const actions = [
    {
      label: 'Create Post',
      description: 'Share updates with your community',
      icon: <PenLine size={20} />,
      onClick: () => navigate('/posts?create=true'),
      color: 'text-[#75C043]',
      bg: 'bg-[#75C043]/5'
    },
    {
      label: 'Start Discussion',
      description: 'Ask a question or start a topic',
      icon: <MessageSquarePlus size={20} />,
      onClick: () => navigate('/discussions/create'),
      color: 'text-blue-500',
      bg: 'bg-blue-500/5'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      {actions.map((action, idx) => (
        <button
          key={idx}
          onClick={action.onClick}
          className="relative flex items-center gap-4 rounded-xl bg-gradient-to-br from-white to-gray-50 p-4 transition-shadow duration-200 hover:shadow-md"
        >
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.bg} ${action.color} transition-transform duration-200 group-hover:scale-125`}>
            {action.icon}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900">{action.label}</span>
            <span className="text-xs text-gray-500">{action.description}</span>
          </div>
          <PlusCircle size={18} className="ml-auto text-gray-300 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        </button>
      ))}
    </div>



  )
}