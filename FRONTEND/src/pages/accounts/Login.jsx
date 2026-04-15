import { useState } from 'react'
import ForgotPasswordWizard from '../../components/ForgotPasswordWizard'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import Button from '../../components/shared/Button'
import AuthLayout from '../../components/authentication/AuthLayout'
import AuthHeader from '../../components/authentication/AuthHeader'
import AuthForm from '../../components/authentication/AuthForm'
import Divider from '../../components/authentication/Divider'
import GoogleAuth from '../../components/authentication/GoogleAuth'
import AuthInput from '../../components/authentication/AuthInput'
import PasswordInput from '../../components/authentication/PasswordInput'

//pattern for email -> must end with @heraldcollege.edu.np
const collegeEmailRegex = /@heraldcollege\.edu\.np$/;

function Login() {
    //form fields
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    // validation
    const [errors, setErrors] = useState({})
    const [formError, setFormError] = useState('')
    const [credentialError, setCredentialError] = useState(false)
    //loading states
    const [isNativeLoading, setIsNativeLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)
    // modal toggle
    const [showForgotPassword, setShowForgotPassword] = useState(false)

    const navigate = useNavigate()
    const { login, googleLogin } = useAuth()
    const { showToast } = useToast()

    // simple frontend validation before API call
    const validate = () => {
        const validationErrors = {}

        if (!email.trim()) {
            validationErrors.email = 'Email is required.'
        } else if (!collegeEmailRegex.test(email)) {
            validationErrors.email = 'Use your @heraldcollege.edu.np email.'
        }

        if (!password) {
            validationErrors.password = 'Password is required.'
        }

        setErrors(validationErrors)
        // reset API-related errors before submit
        setCredentialError(false)
        setFormError('')
        return Object.keys(validationErrors).length === 0
    }

    // redirects user based on role after login
    const handleLoginRedirect = (userData) => {
        const role = userData?.role

        // first log? force change pass
        if (userData?.must_change_password) {
            navigate('/change-password')
            return
        }

        const firstName = userData?.first_name || userData?.username || 'User'
        const msg = `Hello ${firstName}, successfully logged in.`

        if (role === 'admin') {
            window.location.href = `${import.meta.env.VITE_API_BASE_URL}/admin/`
        } else if (role === 'community') {
            showToast(
                `Hello ${userData?.community_name || userData?.username}, successfully logged in.`,
                'success'
            )
            navigate(`/community/${userData?.id}/dashboard`)
        } else {
            showToast(msg, 'success')
            navigate('/feed')
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        // clear previous errors before new submit
        setFormError('')
        setCredentialError(false)

        if (!validate()) return

        try {
            setIsNativeLoading(true)

            const userData = await login(email, password)
            // clear form after successful login
            setEmail('')
            setPassword('')

            handleLoginRedirect(userData)
        } catch (error) {
            const status = error.response?.status

            // handle wrong credentials
            if (status === 400 || status === 401) {
                setCredentialError(true)
                setFormError('Invalid credentials')
            } else {
                showToast('Something went wrong. Try again.', 'error')
            }
        } finally {
            setIsNativeLoading(false)
        }
    }

    const handleGoogleSuccess = async (response) => {
        setIsGoogleLoading(true)

        try {
            const userData = await googleLogin(
                response.credential,
                response.credentialType
            )
            handleLoginRedirect(userData)
        } catch {
            showToast('Google login failed', 'error')
        } finally {
            setIsGoogleLoading(false)
        }
    }

    return (
        <AuthLayout cardWidthClass="max-w-md">
            <AuthHeader
                title="Sign in to HCKonnect"
                subtitle="Continue to your account"
            />

            <AuthForm onSubmit={handleSubmit}>
                <AuthInput
                    label="Email address"
                    type="email"
                    name="email"
                    placeholder="user@heraldcollege.edu.np"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value)
                        setErrors((prev) => ({ ...prev, email: '' }))
                        setFormError('')
                        setCredentialError(false)
                    }}
                    error={errors.email}
                    invalid={Boolean(errors.email) || credentialError}
                />

                <div>
                    <PasswordInput
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value)
                            setErrors((prev) => ({ ...prev, password: '' }))
                            setFormError('')
                            setCredentialError(false)
                        }}
                        error={errors.password}
                        invalid={Boolean(errors.password) || credentialError}
                    />

                    <div className="mt-1 flex items-center justify-between gap-3">
                        {formError ? (
                            <p className="text-xs text-red-600">{formError}</p>
                        ) : (
                            <span />
                        )}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowForgotPassword(true)}
                                className="text-xs text-primary hover:underline"
                            >
                                Forgot password?
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-3">
                    <Button
                        type="submit"
                        className="w-full py-3 text-sm font-semibold shadow-md"
                        isLoading={isNativeLoading}
                        loadingText="Signing in..."
                    >
                        Sign in
                    </Button>
                </div>

                <Divider />

                <GoogleAuth
                    onSuccess={handleGoogleSuccess}
                    label="Sign in with Google"
                    loading={isGoogleLoading}
                />

                <p className="text-center text-sm text-surface-body mt-4">
                    New here?{' '}
                    <Link
                        to="/register"
                        className="font-medium text-primary hover:underline"
                    >
                        Create an account
                    </Link>
                </p>
            </AuthForm>

            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <ForgotPasswordWizard
                    onClose={() => setShowForgotPassword(false)}
                />
            )}
        </AuthLayout>
    )
}

export default Login
