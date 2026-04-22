import { useMemo } from 'react'
import { CONTENT_TYPES } from '../service/feedApi'

export default function FeedFilter({ value = 'all', onChange = () => { } }) {
  const options = useMemo(() => CONTENT_TYPES, [])

  return (
    <div className="w-full">
      <div className="flex items-center gap-1 rounded-xl border border-surface-border bg-zinc-100/80 p-1">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`flex-1 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${value === opt
              ? 'bg-white text-primary shadow-sm ring-1 ring-zinc-200'
              : 'text-surface-muted hover:text-surface-dark hover:bg-white/50'
              }`}
          >
            {opt}
          </button>
        ))}
      </div>

      <div className="md:hidden mt-4">
        <label className="sr-only">Filter feed</label>
        <select
          className="input-standard w-full text-sm font-semibold !rounded-xl"
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

