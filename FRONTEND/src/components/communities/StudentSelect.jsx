import { useState, useEffect } from 'react'
import apiClient from '../../services/apiClient' // Use your interseptor!

export default function StudentSelect({ value, onChange }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    // If query is empty, hide dropdown and clear results
    if (!query.trim()) {
      setResults([])
      setShowDropdown(false)
      return
    }

    const fetchStudents = async () => {
      try {
        setLoading(true)
        // 1. Use apiClient to automatically attach the Bearer Token
        // 2. Use the relative path defined in your Django urls
        const res = await apiClient.get(`/communities/students/?search=${query}`)
        setResults(res.data)
        setShowDropdown(true)
      } catch (err) {
        console.error("Search failed:", err)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(fetchStudents, 400)
    return () => clearTimeout(debounce)
  }, [query])

  const handleSelect = (student) => {
    onChange(student.id);

    // Create a nice display name for the input box
    const fullName = student.first_name && student.last_name
      ? `${student.first_name} ${student.last_name}`
      : student.username;

    setQuery(fullName);
    setShowDropdown(false);
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          placeholder="Type name or email..."
          value={query}
          onFocus={() => query && setShowDropdown(true)}
          onChange={(e) => {
            setQuery(e.target.value)
            if (e.target.value === '') onChange('') // Reset selection if cleared
          }}
          className="w-full rounded-2xl border-2 border-[#e5e7eb] px-4 py-3 text-base focus:border-[#75C043] outline-none transition-all pr-10"
        />
        {loading && (
          <div className="absolute right-3 top-3.5">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#75C043] border-t-transparent"></div>
          </div>
        )}
      </div>

      {showDropdown && (
        <ul className="absolute z-[60] mt-2 w-full max-h-64 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl py-2">
          {results.length > 0 ? (
            results.map((s) => (
              <li
                key={s.id}
                onClick={() => handleSelect(s)}
                className="flex flex-col cursor-pointer px-5 py-3 hover:bg-[#f4f5f2] transition-colors"
              >
                <span className="font-bold text-[#0d1f14]">{s.first_name} {s.last_name} | {s.username}</span>
                <span className="text-xs text-gray-500">{s.email}</span>
              </li>
            ))
          ) : !loading && query.length > 1 ? (
            <li className="px-5 py-4 text-sm text-gray-500 text-center">
              No students found matching "{query}"
            </li>
          ) : null}
        </ul>
      )}
    </div>
  )
}