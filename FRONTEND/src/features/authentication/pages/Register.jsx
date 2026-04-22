import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../components/AuthContext'
import { useToast } from '../../../shared/components/ui/ToastContext'
import Button from '../../../shared/components/ui/Button'
import AuthLayout from '../components/AuthLayout'
import AuthHeader from '../components/AuthHeader'
import AuthForm from '../components/AuthForm'
import FieldError from '../components/FieldError'
import Divider from '../components/Divider'
import GoogleAuth from '../components/GoogleAuth'
import AuthInput from '../components/AuthInput'

const COURSE_OPTIONS = [
  { value: 'bcs', label: 'Bachelor of Computer Science' },
  { value: 'bba', label: 'Bachelor of Business Administration' },
  { value: 'bibm', label: 'Bachelor in International Business Management' },
  { value: 'cybersecurity', label: 'Bachelor in Cyber Security' },
]

const INTEREST_OPTIONS = [
  'ai', 'software_development', 'devops', 'design', 'network_security',
  'ethical_hacking', 'marketing_and_finance', 'project_management',
  'business_analytics', 'leadership', 'research', 'community_engagement'
]

const collegeEmailRegex = /@heraldcollege\.edu\.np$/;

function Register() {
  // store all form values in one state object
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    course: '',
    interests: [],
  })

  const [errors, setErrors] = useState({})//frontend validation error
  const [apiErrors, setApiErrors] = useState({})//backend error for dups mail or username

  const [isNativeLoading, setIsNativeLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const navigate = useNavigate()
  const { register, googleLogin } = useAuth()
  const { showToast } = useToast()

  // handle all input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    // clear errors when user starts typing
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setApiErrors((prev) => ({ ...prev, [name]: '' }))
  }

  // add/remove interest from array
  const toggleInterest = (interest) => {
    setFormData((prev) => {
      const selected = prev.interests.includes(interest)
      return {
        ...prev,
        interests: selected
          ? prev.interests.filter((i) => i !== interest)// remove if already selected
          : [...prev.interests, interest], // add if not selected
      }
    })
  }

  // basic frontend validation
  const validate = () => {
    const e = {}

    if (!formData.firstName.trim()) e.firstName = "First name is required."
    if (!formData.lastName.trim()) e.lastName = "Last name is required."
    if (!formData.username.trim()) e.username = "Username is required."

    if (!formData.email.trim()) {
      e.email = "Email is required."
    } else if (!collegeEmailRegex.test(formData.email)) {
      e.email = "Use your @heraldcollege.edu.np email."
    }

    if (!formData.course) e.course = "Select a course."
    if (formData.interests.length === 0) e.interests = "Pick at least one interest."

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setApiErrors({})
    if (!validate()) return

    try {
      setIsNativeLoading(true)

      const payload = {
        username: formData.username,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        course: formData.course,
        interests: formData.interests
      }

      const res = await register(payload)

      showToast(
        res.message || 'Registration successful! Check your email.',
        'success'
      )

      setFormData({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        course: '',
        interests: []
      })

      navigate('/login', { state: { successMessage: res.message } })

    } catch (error) {
      const backendErrors = error.response?.data || {}
      // map backend field names to frontend fields
      const fieldErrors = {
        username: backendErrors.username
          ? 'User with this username already exists.'
          : '',
        email: backendErrors.email
          ? 'User with this email already exists.'
          : '',
        course: backendErrors.course || '',
        interests: backendErrors.interests || '',
        firstName: backendErrors.first_name || '',
        lastName: backendErrors.last_name || '',
      }

      setApiErrors(fieldErrors)

      //if errors are field-specific
      const hasInlineValidationErrors = Boolean(
        backendErrors.username ||
        backendErrors.email ||
        backendErrors.course ||
        backendErrors.interests ||
        backendErrors.first_name ||
        backendErrors.last_name
      )

      // collect other messages for toast
      const messageParts = [
        backendErrors.message,
        ...(Array.isArray(backendErrors.course) ? backendErrors.course : backendErrors.course ? [backendErrors.course] : []),
        ...(Array.isArray(backendErrors.interests) ? backendErrors.interests : backendErrors.interests ? [backendErrors.interests] : []),
        ...(Array.isArray(backendErrors.non_field_errors) ? backendErrors.non_field_errors : backendErrors.non_field_errors ? [backendErrors.non_field_errors] : []),
        backendErrors.detail,
      ].filter(Boolean)

      if (!hasInlineValidationErrors || messageParts.length > 0) {
        showToast(messageParts.join(' ') || "Registration failed", "error")
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

      if (userData.role === 'community') {
        navigate(`/community/${userData.id}/dashboard`)
      } else {
        navigate('/feed')
      }

    } catch {
      showToast("Google login failed", "error")
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <AuthLayout>
      <AuthHeader
        title="Create Your Account"
        subtitle="Get started with HCKonnect"
      />

      <AuthForm onSubmit={handleSubmit}>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AuthInput
            label="First name"
            name="firstName"
            placeholder="Enter your first name"
            value={formData.firstName}
            onChange={handleChange}
            error={errors.firstName || apiErrors.firstName}
            invalid={Boolean(errors.firstName || apiErrors.firstName)}
          />
          <AuthInput
            label="Last name"
            name="lastName"
            placeholder="Enter your last name"
            value={formData.lastName}
            onChange={handleChange}
            error={errors.lastName || apiErrors.lastName}
            invalid={Boolean(errors.lastName || apiErrors.lastName)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AuthInput
            label="Username"
            name="username"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleChange}
            error={errors.username || apiErrors.username}
            invalid={Boolean(errors.username || apiErrors.username)}
            errorClassName="mt-1.5 w-full max-w-[420px] text-left text-xs text-red-600"
          />
          <AuthInput
            label="Email address"
            name="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleChange}
            error={errors.email || apiErrors.email}
            invalid={Boolean(errors.email || apiErrors.email)}
            errorClassName="mt-1.5 w-full max-w-[420px] text-left text-xs text-red-600"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-surface-body">Course</label>
          <select
            name="course"
            value={formData.course}
            onChange={handleChange}
            className="w-full rounded-lg border border-surface-border bg-white px-4 py-3 text-sm"
          >
            <option value="">Select your course</option>
            {COURSE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError message={errors.course || apiErrors.course} />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-medium text-surface-body">
            Select your interests
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {INTEREST_OPTIONS.map((interest) => {
              const selected = formData.interests.includes(interest)

              return (
                <label
                  key={interest}
                  className={`flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-xs transition ${selected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-surface-border text-surface-body hover:border-primary'
                    }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={selected}
                    onChange={() => toggleInterest(interest)}
                  />
                  <span className="capitalize">
                    {interest.replace(/_/g, ' ')}
                  </span>
                </label>
              )
            })}
          </div>

          <FieldError message={errors.interests || apiErrors.interests} />
        </div>

        <Button
          type="submit"
          isLoading={isNativeLoading}
          loadingText="Creating account..."
        >
          Create account
        </Button>

        <Divider />

        <GoogleAuth
          onSuccess={handleGoogleSuccess}
          label="Sign up with Google"
          loading={isGoogleLoading}
        />

        <p className="text-center text-sm text-surface-body mt-4">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>

      </AuthForm>
    </AuthLayout>
  )
}

export default Register