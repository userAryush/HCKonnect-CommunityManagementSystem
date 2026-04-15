import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import FieldError from './FieldError';

function PasswordInput({ value, onChange, error, invalid = false }) {
    const [show, setShow] = useState(false) // state to toggle password visibility (show/hide)

    return (
        <div className="space-y-2">
            <label className="text-xs font-medium text-surface-dark/80">
                Password
            </label>

            <div className="relative">
                <input
                // if show is true - type becomes text - otherwise password
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    placeholder="Enter your password"
                    aria-invalid={invalid}
                    className={`w-full rounded-lg border bg-white px-4 py-3 pr-10 text-sm text-surface-dark focus:outline-none ${invalid
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                        : 'border-surface-border focus:border-primary focus:ring-2 focus:ring-primary/20'
                        }`}
                />
                {/* //button to toggle password visibility * */}
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute inset-y-0 right-3 flex items-center text-surface-body"
                >
                    {/* // change the icon based on state */}
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>

            <FieldError message={error} />
        </div>
    )
}

export default PasswordInput;
