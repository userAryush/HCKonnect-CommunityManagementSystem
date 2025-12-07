import { useState } from 'react'
import axios from 'axios'
import logo from '../assets/logo.png'

// pattern for email -> must start with np and must end with @heraldcollege.edu.np
const collegeEmailRegex = /^np.+@heraldcollege\.edu\.np$/;



function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false) //toggle for show hide password
    const [errors, setErrors] = useState({})
    const [apiErrors, setApiErrors] = useState({})  // errors returned by backend side
    const [successMessage, setSuccessMessage] = useState('')  // login successful message
    const [loading, setLoading] = useState(false)

    const validate = () => {
        const validationErrors = {};

        // Email validation
        if (!email.trim()) {
            validationErrors.email = 'Email is required.';
        }
        // else check if its heraldcollege email
        else {
            if (!collegeEmailRegex.test(email)) {
                validationErrors.email = 'Use your @heraldcollege.edu.np email.';
            }
        }

        // Password validation
        if (!password) {
            validationErrors.password = 'Password is required.';
        }

        setErrors(validationErrors);

        return Object.keys(validationErrors).length === 0;
    };


    const handleSubmit = async (event) => {
        //prevents page refresh when form is submitted
        event.preventDefault()

        // it clears old success message
        setSuccessMessage('')

        // clears backend error messages before sending new request
        setApiErrors({})

        // at first we need to check if the inputs i.e. email and password are valid, if not it returns
        if (!validate()) return

        try {

            // shows loading state, disables button and showa signing in..
            setLoading(true)

            // calls backend api, sends post req with email and pass, if cred are correct, no error
            await axios.post('http://127.0.0.1:8000/accounts/login/', {
                email,
                password,
            })

            //shows msg to user after successful logi
            setSuccessMessage('Login successful! Redirecting…')
            setEmail('')
            setPassword('')

            // if anything fails it goes to catch block
        } catch (error) {
            const backendErrors = error.response?.data || {}
            setApiErrors(backendErrors)

        } finally {
            // loading false cumpulsory even if its a error or success
            setLoading(false)
        }
    }

    const inputBase =
        'w-full max-w-[420px] rounded-lg border border-[#6d6e70]/40 bg-white px-4 py-2.5 text-sm placeholder:text-[#6d6e70]/60 focus:border-[#6d6e70] focus:outline-none'

    return (
        <div className="flex min-h-screen w-full bg-[#f4f5f2] font-['Inter',sans-serif] text-[#111]">
            <div className="flex min-h-screen w-full flex-col overflow-hidden bg-white shadow-2xl lg:flex-row">
                <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center lg:px-12">
                    <div className="w-full max-w-[420px] space-y-6">
                        <div>
                            <p className="text-sm uppercase tracking-[0.4em] text-[#6d6e70]">Login</p>
                            <h1 className="mt-3 text-3xl font-semibold text-[#74bf44]">Welcome Back</h1>
                            <p className="mt-2 text-sm text-[#6d6e70]">Log in to continue exploring Herald College Communities</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex flex-col items-center">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    className={inputBase}
                                    value={email}
                                    onChange={(event) => {
                                        setEmail(event.target.value)
                                        setErrors((prev) => ({ ...prev, email: '' }))
                                        setApiErrors((prev) => ({ ...prev, email: '' }))
                                    }} />
                                <FieldError message={errors.email || apiErrors.email} />
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="relative w-full max-w-[420px]">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="Password"
                                        className={inputBase}
                                        value={password}
                                        onChange={(event) => {
                                            setPassword(event.target.value)
                                            setErrors((prev) => ({ ...prev, password: '' }))
                                            setApiErrors((prev) => ({ ...prev, password: '' }))
                                        }} />
                                    <button type="button" onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute inset-y-0 right-4 flex items-center text-xs font-semibold text-[#6d6e70]">
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                                <FieldError message={errors.password || apiErrors.password} />
                            </div>

                            {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

                            <button type="submit" disabled={loading}
                                className={`w-full max-w-[420px] rounded-full bg-[#74bf44] py-2.5 text-sm font-semibold text-white transition hover:bg-[#62a837] ${loading ? 'cursor-not-allowed opacity-70' : ''
                                    }`}>
                                {loading ? 'Signing In…' : 'Sign In'}
                            </button>

                            <Divider />

                            <GoogleButton label="Sign In with Google" />

                            <p className="text-xs text-[#6d6e70]">
                                New here?{' '}
                                <a href="/register" className="font-semibold text-[#6d6e70] underline-offset-4 hover:underline">
                                    Create an account
                                </a>
                            </p>
                        </form>
                    </div>
                </div>

                <div className="flex flex-1 items-center justify-center bg-[#0d1f14] px-8 py-16">
                    <img src={logo} alt="HCKonnect logo" className="w-full max-w-[250px]" />
                </div>
            </div>
        </div>
    )
}

function FieldError({ message }) {
    if (!message) return null
    return <p className="mt-1 text-xs text-red-600">{Array.isArray(message) ? message.join(', ') : message}</p>
}
function Divider() {
    return (
        <div className="flex items-center gap-4 text-xs text-[#6d6e70]">
            <span className="h-px flex-1 bg-[#6d6e70]/30" />
            OR
            <span className="h-px flex-1 bg-[#6d6e70]/30" />
        </div>
    )
}

function GoogleButton({ label }) {
    return (
        <button
            type="button"
            className="flex w-full max-w-[420px] items-center justify-center gap-2 rounded-full border border-[#6d6e70] bg-white py-2.5 text-sm font-semibold text-[#6d6e70] transition hover:bg-[#f6f6f6]"
        >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
            {label}
        </button>
    )
}

export default Login

