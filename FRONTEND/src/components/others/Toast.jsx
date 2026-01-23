import { useEffect } from 'react'

export default function Toast({ message, onClose, duration = 4000 }) {
    useEffect(() => {
        if (!message) return
        const timer = setTimeout(onClose, duration)
        return () => clearTimeout(timer)
    }, [message, duration, onClose])

    if (!message) return null

    return (
        <div className="fixed right-6 top-6 z-50 rounded-xl bg-[#75C043]/80 backdrop-blur-sm
            px-4 py-3 text-sm text-white shadow-lg shadow-[#75C043]/30 ring-1 ring-white/20">
            {message}
            <button onClick={onClose} className="ml-2 font-bold">×</button>
        </div>
    )
}

