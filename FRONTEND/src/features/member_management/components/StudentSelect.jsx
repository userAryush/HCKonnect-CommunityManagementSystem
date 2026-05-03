import { useState, useEffect } from 'react'
import apiClient from '../../../shared/services/apiClient' // Use your interseptor!

export default function StudentSelect({ value, onChange }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isSelectionLocked, setIsSelectionLocked] = useState(false)

  const normalize = (text) => (text || '').toString().toLowerCase().trim()
  const toDisplayName = (student) => {
    const fullName = `${student.first_name || ''} ${student.last_name || ''}`.trim()
    return fullName || student.username || student.email || ''
  }
  const matchesQuery = (student, rawQuery) => {
    const q = normalize(rawQuery)
    if (!q) return true
    const fullName = normalize(`${student.first_name || ''} ${student.last_name || ''}`)
    const firstName = normalize(student.first_name)
    const lastName = normalize(student.last_name)
    const username = normalize(student.username)
    const email = normalize(student.email)
    return (
      fullName.includes(q) ||
      firstName.includes(q) ||
      lastName.includes(q) ||
      username.includes(q) ||
      email.includes(q)
    )
  }

  useEffect(() => {
    if (isSelectionLocked) return

    // If query is empty, hide dropdown and clear results
    if (!query.trim()) {
      setResults([])
      setShowDropdown(false)
      return
    }

    const fetchStudents = async () => {
      try {
        setLoading(true)
        const tokens = Array.from(new Set(query.trim().split(/\s+/).filter(Boolean)))
        const candidateQueries = Array.from(new Set([
          query.trim(),
          ...tokens
        ]))

        const responses = await Promise.all(
          candidateQueries.map((q) => apiClient.get(`/communities/students/?search=${encodeURIComponent(q)}`))
        )

        const merged = []
        const seen = new Set()
        responses.forEach((res) => {
          ;(res.data || []).forEach((student) => {
            if (!seen.has(student.id)) {
              seen.add(student.id)
              merged.push(student)
            }
          })
        })

        const filtered = merged.filter((student) => matchesQuery(student, query))
        setResults(filtered)
        setShowDropdown(true)
      } catch (err) {
        console.error("Search failed:", err)
        setResults([])
        setShowDropdown(true)
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(fetchStudents, 400)
    return () => clearTimeout(debounce)
  }, [query, isSelectionLocked])

  const handleSelect = (student) => {
    onChange(student.id)
    setQuery(toDisplayName(student))
    setIsSelectionLocked(true)
    setResults([])
    setShowDropdown(false)
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
            setIsSelectionLocked(false)
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
