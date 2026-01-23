import { useState, useEffect } from 'react'
import axios from 'axios'

export default function StudentSelect({ value, onChange }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    if (!query) {
      setResults([])
      return
    }

    const fetchStudents = async () => {
      try {
        setLoading(true)
        const res = await axios.get(`http://localhost:8000/communities/students/?search=${query}`)
        setResults(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(fetchStudents, 300) // wait 300ms
    return () => clearTimeout(debounce)
  }, [query])

  const handleSelect = (student) => {
    onChange(student.id)
    setQuery(student.username || student.email)
    setShowDropdown(false)
  }

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search student..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setShowDropdown(true)
        }}
        className="w-full rounded-xl border border-[#e5e7eb] px-4 py-2 text-sm focus:border-[#75C043] outline-none"
      />
      {showDropdown && results.length > 0 && (
        <ul className="absolute z-50 w-full max-h-60 overflow-y-auto rounded-xl border border-gray-300 bg-white shadow-lg">
          {results.map((s) => (
            <li
              key={s.id}
              onClick={() => handleSelect(s)}
              className="cursor-pointer px-4 py-2 hover:bg-[#f0f0f0]"
            >
              {s.username || s.email}
            </li>
          ))}
        </ul>
      )}
      {loading && <div className="absolute top-full left-0 mt-1 text-sm text-gray-500">Loading…</div>}
    </div>
  )
}
