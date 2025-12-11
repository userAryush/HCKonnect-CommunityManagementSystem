import { useMemo } from 'react'
import { CONTENT_TYPES } from '../../services/feedApi'

export default function FeedFilter({ value = 'all', onChange = () => {} }) {
  const options = useMemo(() => CONTENT_TYPES, [])

  return (
    <div className="w-full">
      <div className="hidden md:flex items-center gap-2 rounded-3xl border border-[#e5e7eb] bg-white p-2 shadow-lg shadow-black/5">
        {options.map((opt) => {
          const active = value === opt
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`relative rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                active ? 'text-[#0d1f14]' : 'text-[#4b4b4b]'
              }`}
            >
              <span className="capitalize">{opt}</span>
              <span
                className={`absolute inset-x-2 bottom-1 h-1 rounded-full transition-all ${
                  active ? 'bg-[#75C043] opacity-100' : 'opacity-0'
                }`}
              />
            </button>
          )
        })}
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

