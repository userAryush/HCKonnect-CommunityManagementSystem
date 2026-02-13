import { useMemo } from 'react'
import { CONTENT_TYPES } from '../../services/feedApi'

export default function FeedFilter({ value = 'all', onChange = () => { } }) {
  const options = useMemo(() => CONTENT_TYPES, [])

  return (
    <div className="w-full">
      <div className="flex items-center gap-1 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-md p-1.5 shadow-sm">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-6 py-2 text-sm font-bold rounded-xl transition-all ${value === opt ? 'bg-[#75C043] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'
              }`}
          >
            <span className="capitalize">{opt}</span>
          </button>
        ))}
      </div>

      <div className="md:hidden">
        <label className="sr-only">Filter feed</label>
        <select
          className="w-full rounded-2xl border border-[#e5e7eb] bg-white px-3 py-2 text-sm font-semibold text-[#0d1f14] shadow-lg shadow-black/5"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((opt) => (
            <option key={opt} value={opt} className="capitalize">
              {opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

