import { useNavigate } from 'react-router-dom'

export default function HeaderActionsRow() {
  const navigate = useNavigate()

  return (
    <div className="flex gap-4 mb-6">
      <button
        onClick={() => console.log('Create Post')}
        className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-sm transition hover:shadow-md hover:bg-gray-50 flex-1 border border-[#e5e7eb]"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#75C043]/10 text-[#75C043]">
          ✍️
        </div>
        <div className="flex flex-col items-start">
          <span className="text-sm font-bold text-[#0d1f14]">Create Post</span>
        </div>
      </button>

      <button
        onClick={() => navigate('/feed?action=discussion')}
        className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-sm transition hover:shadow-md hover:bg-gray-50 flex-1 border border-[#e5e7eb]"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#75C043]/10 text-[#75C043]">
          💬
        </div>
        <div className="flex flex-col items-start">
          <span className="text-sm font-bold text-[#0d1f14]">Start Discussion</span>
        </div>
      </button>
    </div>
  )
}
