import { useNavigate } from 'react-router-dom'
import { PenLine, MessageSquarePlus } from 'lucide-react'

export default function HeaderActionsRow() {
  const navigate = useNavigate()


  return (
    <div className="inline-flex p-1 bg-slate-100/50 border border-surface-border rounded-xl gap-1 mb-8">
      {[
        { label: 'Create Post', icon: <PenLine size={15} />, path: '/posts?create=true' },
        { label: 'Start Discussion', icon: <MessageSquarePlus size={15} />, path: '/discussions/create' }
      ].map((item) => (
        <button
          key={item.label}
          onClick={() => navigate(item.path)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent hover:bg-white hover:text-primary hover:shadow-sm border border-transparent hover:border-surface-border/50 text-surface-body transition-all duration-200"
        >
          <span className="opacity-70">{item.icon}</span>
          <span className="text-[13px] font-bold uppercase tracking-wider">{item.label}</span>
        </button>
      ))}
    </div>
  )
}
