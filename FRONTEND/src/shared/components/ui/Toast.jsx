import { useEffect, useRef, useState } from 'react'
import { Info, CheckCircle2, AlertCircle } from 'lucide-react'

export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
    const [isPaused, setIsPaused] = useState(false)
    const [remainingMs, setRemainingMs] = useState(duration)
    const rafIdRef = useRef(null)

    useEffect(() => {
        if (!message) return
        setIsPaused(false)
        setRemainingMs(duration)
    }, [message, type, duration])

    useEffect(() => {
        if (!message) return
        if (isPaused) return
        const timer = setTimeout(onClose, remainingMs)
        return () => clearTimeout(timer)
    }, [message, isPaused, remainingMs, onClose])

    useEffect(() => {
        if (!message) return undefined
        if (isPaused) return undefined
        if (remainingMs <= 0) return undefined

        const startTime = performance.now()
        const initialRemaining = remainingMs

        const tick = (now) => {
            const elapsed = now - startTime
            const nextRemaining = Math.max(initialRemaining - elapsed, 0)
            setRemainingMs(nextRemaining)
            if (nextRemaining > 0) {
                rafIdRef.current = requestAnimationFrame(tick)
            }
        }

        rafIdRef.current = requestAnimationFrame(tick)
        return () => {
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
        }
    }, [message, isPaused, remainingMs])

    if (!message) return null

    const typeStyles = {
        success: 'text-primary',
        error: 'text-red-500',
        info: 'text-blue-500'
    }

    const progressStyles = {
        success: 'bg-primary',
        error: 'bg-red-50',
        info: 'bg-blue-50'
    }

    const icons = {
        success: <CheckCircle2 size={18} />,
        error: <AlertCircle size={18} />,
        info: <Info size={18} />
    }

    return (
        <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="fixed right-6 top-6 z-[100] w-[min(24rem,calc(100vw-3rem))] overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 text-sm text-slate-700 shadow-xl shadow-slate-900/10 backdrop-blur-md ring-1 ring-white/80 transition-all animate-in slide-in-from-top-4 fade-in duration-300"
        >
            <div className="flex items-center gap-3">
                <span className={typeStyles[type] || typeStyles.success}>
                    {icons[type] || icons.success}
                </span>
                <span className="font-medium">{message}</span>
                <button
                    onClick={onClose}
                    className="ml-auto text-slate-400 transition-colors hover:text-slate-600"
                    aria-label="Dismiss notification"
                >
                    ×
                </button>
            </div>
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-200/80">
                <div
                    className={`h-full rounded-full ${progressStyles[type] || progressStyles.success}`}
                    style={{
                        width: `${Math.max((remainingMs / duration) * 100, 0)}%`,
                    }}
                />
            </div>
        </div>
    )
}

