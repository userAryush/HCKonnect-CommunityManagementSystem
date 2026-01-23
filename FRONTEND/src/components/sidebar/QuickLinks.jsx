export default function QuickLinks() {
  const links = [
    { label: 'Create public discussion', icon: '💬', action: () => console.log('Create public discussion') },
    { label: 'View current discussions', icon: '👀', action: () => console.log('View current discussions') },
    { label: 'Suggest me', icon: '💡', action: () => console.log('Suggest me') },
  ]

  return (
    <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-bold text-[#0d1f14]">Quick Links</h3>
      <div className="flex flex-col gap-2">
        {links.map((link) => (
          <button
            key={link.label}
            onClick={link.action}
            className="flex w-full items-center gap-3 rounded-xl bg-[#f4f5f2] px-4 py-3 text-left text-sm font-semibold text-[#0d1f14] transition hover:bg-[#e5e7eb]"
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
