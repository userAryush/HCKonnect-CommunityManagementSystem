import { useEffect } from 'react'

import { useEffect } from 'react'
import { Info, CheckCircle2, AlertCircle } from 'lucide-react'

export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
    useEffect(() => {
        if (!message) return
        const timer = setTimeout(onClose, duration)
        return () => clearTimeout(timer)
    }, [message, duration, onClose])

    if (!message) return null

    const typeStyles = {
        success: 'bg-[#75C043]/90 shadow-[#75C043]/30 text-white',
        error: 'bg-red-500/90 shadow-red-500/30 text-white',
        info: 'bg-blue-500/90 shadow-blue-500/30 text-white'
    }

    const icons = {
        success: <CheckCircle2 size={18} />,
        error: <AlertCircle size={18} />,
        info: <Info size={18} />
    }

    return (
        <div className={`fixed right-6 top-6 z-[100] flex items-center gap-3 rounded-xl backdrop-blur-md px-4 py-3 text-sm shadow-lg ring-1 ring-white/20 transition-all animate-in slide-in-from-top-4 fade-in duration-300 ${typeStyles[type] || typeStyles.success}`}>
            {icons[type] || icons.success}
            <span className="font-medium whitespace-nowrap">{message}</span>
            <button onClick={onClose} className="ml-2 font-bold opacity-70 hover:opacity-100 transition-opacity">×</button>
        </div>
    )
}

