import { useState } from 'react'
import logo from '../../assets/favicon.png'
import ForgotPasswordWizard from '../../components/ForgotPasswordWizard'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import authService from '../../services/authService'
import Button from '../../components/shared/Button'
import { GoogleLogin } from '@react-oauth/google'


// pattern for email -> must start with np and must end with @heraldcollege.edu.np
const collegeEmailRegex = /^np.+@heraldcollege\.edu\.np$/;



function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false) //toggle for show hide password
    const [errors, setErrors] = useState({})
    const [apiErrors, setApiErrors] = useState({})  // errors returned by backend side
    const [successMessage, setSuccessMessage] = useState('')  // login successful message
    const [isNativeLoading, setIsNativeLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)
    const [showForgotPassword, setShowForgotPassword] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const [toastMessage, setToastMessage] = useState(location.state?.successMessage || '')
    const { login, googleLogin } = useAuth()
    const { showToast } = useToast()


    const validate = () => {
        const validationErrors = {};

        // Email validation
        if (!email.trim()) {
            validationErrors.email = 'Email is required.';
        }
        // else check if its herald college email
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


    const handleLoginRedirect = async (userData) => {
        const role = userData?.role;
        console.log("Redirecting for role:", role);

        try {
            const firstName = userData.first_name || userData.username || 'User';
            const msg = `hello ${firstName}, successfully logged in.`;

            if (role === 'admin') {
                window.location.href = 'http://127.0.0.1:8000/admin/';
            } else if (role === 'community') {
                showToast(`hello ${userData.community_name || userData.username}, successfully logged in.`, 'success')
                navigate(`/community/${userData.id}/dashboard`)
            } else {
                showToast(msg, 'success');
                navigate('/feed');
            }
        } catch (error) {
            console.error("Error redirecting user:", error);
            showToast("Login successful, but failed to extract redirect details.", 'error');
            navigate('/feed'); // Fallback to feed
        }
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
            setIsNativeLoading(true)

            // calls backend api, via authContext
            const userData = await login(email, password)
            console.log("Login successful, user data:", userData);

            //shows msg to user after successful logi
            setEmail('')
            setPassword('')

            handleLoginRedirect(userData);

        } catch (error) {
            console.error("Login Error:", error);
            const backendErrors = error.response?.data || {}
            setApiErrors(backendErrors)
            showToast(error.response?.data?.detail || "An error occurred during login", 'error')
        } finally {
            // loading false cumpulsory even if its a error or success
            setIsNativeLoading(false)
        }
    }

    const handleGoogleSuccess = async (credentialResponse) => {
        setApiErrors({});
        setIsGoogleLoading(true);
        try {
            const userData = await googleLogin(credentialResponse.credential);
            handleLoginRedirect(userData);
        } catch (error) {
            console.error("Google Login Error:", error);
            const backendError = error.response?.data?.error || "Google authentication failed";
            setApiErrors({ google: backendError });
            showToast(backendError, 'error');
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const inputBase =
        'w-full max-w-[420px] rounded-lg border border-[#6d6e70]/40 bg-white px-4 py-2.5 text-sm placeholder:text-[#6d6e70]/60 focus:border-[#6d6e70] focus:outline-none'

    return (
        <div className="theme-original">
            <div className="flex min-h-screen w-full items-center justify-center bg-secondary px-6 py-12 antialiased">
                <div className="w-full max-w-md">
                    <div className="card-border bg-surface p-10 shadow-xl">
                        <div className="mb-10 text-center">
                            <img src={logo} alt="HCKonnect" className="mx-auto h-12 w-12 mb-6" />
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-2">Welcome Back</p>
                            <h1 className="text-3xl font-display font-bold tracking-tight text-surface-dark">Sign in to HCKonnect</h1>
                            <p className="mt-3 text-sm text-surface-body leading-relaxed text-center">One platform. Every community.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-surface-body ml-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="use-email-with@heraldcollege.edu.np"
                                    className="w-full rounded-button border border-surface-border bg-secondary/30 px-4 py-3 text-sm text-surface-dark placeholder:text-surface-body focus:border-primary focus:ring-4 focus:ring-brand/10 focus:outline-none transition-all"
                                    value={email}
                                    onChange={(event) => {
                                        setEmail(event.target.value)
                                        setErrors((prev) => ({ ...prev, email: '' }))
                                        setApiErrors((prev) => ({ ...prev, email: '' }))
                                    }} />
                                <FieldError message={errors.email || apiErrors.email} />
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between items-end mb-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-surface-body ml-1">Password</label>
                                    <button
                                        type="button"
                                        onClick={() => setShowForgotPassword(true)}
                                        className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline underline-offset-4"
                                    >
                                        Forgot?
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="password.."
                                        className="w-full rounded-button border border-surface-border bg-secondary/30 px-4 py-3 text-sm text-surface-dark placeholder:text-surface-body focus:border-primary focus:ring-4 focus:ring-brand/10 focus:outline-none transition-all"
                                        value={password}
                                        onChange={(event) => {
                                            setPassword(event.target.value)
                                            setErrors((prev) => ({ ...prev, password: '' }))
                                            setApiErrors((prev) => ({
                                                ...prev,
                                                non_field_errors: '',
                                                detail: '',
                                            }))
                                        }} />
                                    <button type="button" onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute inset-y-0 right-4 flex items-center text-[10px] font-bold uppercase tracking-wider text-surface-body hover:text-surface-dark">
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                                <FieldError
                                    message={
                                        errors.password ||
                                        apiErrors.password ||
                                        apiErrors.non_field_errors ||
                                        apiErrors.detail
                                    }
                                />
                            </div>

                            {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

                            <Button
                                type="submit"
                                className="w-full shadow-md"
                                isLoading={isNativeLoading}
                                loadingText="Signing in..."
                            >
                                Sign In
                            </Button>

                            <Divider />

                            <div className="w-full relative flex justify-center mt-4">
                                {isGoogleLoading && (
                                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 rounded-md">
                                        <svg className="h-6 w-6 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </div>
                                )}
                                <div className="w-full">
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => {
                                            showToast("Google authentication failed. Please try again.", 'error')
                                            setIsGoogleLoading(false)
                                        }}
                                        useOneTap={false}
                                        context="signin"
                                        ux_mode="popup"
                                        theme="outline"
                                        size="large"
                                        shape="rectangular"
                                        logo_alignment="center"
                                        width="100%"
                                        text="signin_with"
                                    />
                                </div>
                                <FieldError message={apiErrors.google} />
                            </div>

                            <p className="text-center text-xs text-surface-body font-medium">
                                New here?{' '}
                                <a href="/register" className="font-bold text-surface-dark hover:text-primary transition-colors underline decoration-brand decoration-2 underline-offset-4">
                                    Create an account
                                </a>
                            </p>
                        </form>
                    </div>
                </div>

                {showForgotPassword && (
                    <ForgotPasswordWizard onClose={() => setShowForgotPassword(false)} />
                )}
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
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-surface-body">
            <span className="h-px flex-1 bg-oat" />
            OR
            <span className="h-px flex-1 bg-oat" />
        </div>
    )
}


export default Login

