function FieldError({ message, className = 'mt-1 w-full max-w-[420px] text-left text-xs text-red-600' }) {
    if (!message) return null // If no error exists, render nothing (prevents empty DOM nodes)

    // If multiple errors exist, join them into a readable string
    return <p className={className}>{Array.isArray(message) ? message.join(', ') : message}</p>
}

export default FieldError;
