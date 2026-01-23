import { useNavigate } from 'react-router-dom'

export default function HeaderActionsRow() {
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
      {/* Card 1: Create Post */}
      <div className="flex flex-col items-start justify-between rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm transition hover:shadow-md h-full">
        <div>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4f5f2] text-xl">
            ✍️
          </div>
          <h3 className="text-base font-bold text-[#0d1f14]">Create Post</h3>
          <p className="mt-1 text-xs text-[#4b4b4b]">Share updates, photos, or thoughts with your community.</p>
        </div>
        <button
          onClick={() => console.log('Create Post')}
          className="mt-4 w-full rounded-xl bg-[#75C043] py-2.5 text-xs font-bold text-[#0f1a12] shadow-lg shadow-[#75C043]/20 transition hover:bg-[#68ae3b] hover:shadow-[#75C043]/30"
        >
          Create New Post +
        </button>
      </div>

      {/* Card 2: Start Public Discussion */}
      <div className="flex flex-col items-start justify-between rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm transition hover:shadow-md h-full">
        <div>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4f5f2] text-xl">
            💬
          </div>
          <h3 className="text-base font-bold text-[#0d1f14]">Start Public Discussion</h3>
          <p className="mt-1 text-xs text-[#4b4b4b]">Initiate a topic for debate and discussion.</p>
        </div>
        <button
          onClick={() => navigate('/feed?action=discussion')}
          className="mt-4 w-full rounded-xl border-2 border-[#75C043] bg-transparent py-2.5 text-xs font-bold text-[#75C043] transition hover:bg-[#68ae3b] hover:text-white"
        >
          Start Discussion
        </button>
      </div>

      {/* Card 3: Quick Actions */}
      <div className="flex flex-col rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm transition hover:shadow-md h-full">
        <h3 className="mb-3 text-base font-bold text-[#0d1f14]">Quick Actions</h3>
        <div className="flex flex-col gap-2 flex-1">
          <button onClick={() => navigate('/communities')} className="flex items-center justify-between rounded-xl bg-[#f4f5f2] px-3 py-2.5 text-xs font-semibold text-[#0d1f14] transition hover:bg-[#e5e7eb]">
            <span>View Communities</span>
            <span>→</span>
          </button>
          <button onClick={() => navigate('/profile')} className="flex items-center justify-between rounded-xl bg-[#f4f5f2] px-3 py-2.5 text-xs font-semibold text-[#0d1f14] transition hover:bg-[#e5e7eb]">
            <span>Manage Profile</span>
            <span>→</span>
          </button>
          <button onClick={() => console.log('Invite')} className="flex items-center justify-between rounded-xl bg-[#f4f5f2] px-3 py-2.5 text-xs font-semibold text-[#0d1f14] transition hover:bg-[#e5e7eb]">
            <span>Notifications</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  )
}
