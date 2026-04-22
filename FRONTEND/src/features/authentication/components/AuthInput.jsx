import FieldError from './FieldError';
// Reusable controlled input component for authentication forms
// Includes label, validation state, and error display handling

function AuthInput({ label, type = "text", name, value, onChange, placeholder, error, invalid = false, errorClassName }) {
    return (
        <div>
            <label className="text-xs font-medium text-surface-dark/80 mb-1 block">
                {label}
            </label>

            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                // Helps accessibility tools detect validation state
                aria-invalid={invalid}
                className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-surface-dark placeholder:text-surface-body/70 focus:outline-none transition-all ${invalid
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                    : 'border-surface-border focus:border-primary focus:ring-2 focus:ring-primary/20'
                    }`}
            />

            {/* // Shows validation message if present */}
            <FieldError message={error} className={errorClassName} />
        </div>
    )
}

export default AuthInput;
