import { useState } from 'react'
import axios from 'axios'
import logo from '../../assets/favicon.png'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../../context/AuthContext'


const COURSE_OPTIONS = [
  { value: 'bcs', label: 'Bachelor of Computer Science' },
  { value: 'bba', label: 'Bachelor of Business Administration' },
  { value: 'bibm', label: 'Bachelor in International Business Management' },
  { value: 'cybersecurity', label: 'Bachelor in Cyber Security' },
]

const INTEREST_OPTIONS = ['ai', 'software_development', 'devops', 'design', 'network_security', 'ethical_hacking', 'marketing_and_finance', 'project_management', 'business_analytics', 'leadership', 'research', 'community_engagement']

const collegeEmailRegex = /^np.+@heraldcollege\.edu\.np$/;



function Register() {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', username: '', email: '', course: '', interests: [],
  })

  const [errors, setErrors] = useState({})
  const [apiErrors, setApiErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { googleLogin } = useAuth()

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setApiErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const toggleInterest = (interest) => {
    setFormData((prev) => {
      const alreadySelected = prev.interests.includes(interest)
      return {
        ...prev,
        interests: alreadySelected
          ? prev.interests.filter((item) => item !== interest)
          : [...prev.interests, interest],
      }
    })
  }

  const validate = () => {
    const validationErrors = {};

    // First Name
    if (!formData.firstName.trim()) {
      validationErrors.firstName = "First name is required.";
    }

    // Last Name
    if (!formData.lastName.trim()) {
      validationErrors.lastName = "Last name is required.";
    }

    // Username
    if (!formData.username.trim()) {
      validationErrors.username = "Username is required.";
    }



    // Email
    if (!formData.email.trim()) {
      validationErrors.email = "Email is required.";
    } else {
      if (!collegeEmailRegex.test(formData.email)) {
        validationErrors.email = "Use your @heraldcollege.edu.np email.";
      }
    }



    // Course
    if (!formData.course) {
      validationErrors.course = "Select a course.";
    }

    // Interests
    if (formData.interests.length === 0) {
      validationErrors.interests = "Pick at least one interest.";
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };


  const handleLoginRedirect = (userData) => {
    const role = userData?.role;
    console.log("Redirecting for role:", role);

    if (role === 'admin') {
      window.location.href = 'http://127.0.0.1:8000/admin/';
    } else if (role === 'community') {
      if (userData.id) {
        navigate(`/community/${userData.id}/dashboard`, { state: { success: 'Login successful!' } });
      } else {
        navigate('/feed', { state: { success: 'Login successful!' } });
      }
    } else {
      navigate('/feed', { state: { success: 'Login successful!' } });
    }
  };


  const handleSubmit = async (event) => {
    event.preventDefault()
    setSuccessMessage('')
    setApiErrors({})
    if (!validate()) return

    try {
      setLoading(true)

      const payload = {
        username: formData.username,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        course: formData.course,
        interests: formData.interests
      }

      const response = await axios.post('http://localhost:8000/accounts/register/', payload)

      // Set toast message
      setSuccessMessage(response.data.message || 'Registration successful! Check your email for login credentials.')


      // Clear the form
      setFormData({ firstName: '', lastName: '', username: '', email: '', course: '', interests: [] })

      setTimeout(() => {
        navigate('/login', { state: { successMessage: response.data.message } })
      }, 500)


    } catch (error) {
      // ✅ Use backend errors (field-specific or general)
      const backendErrors = error.response?.data || {}

      // Example: backend returns { email: ["Email already exists"], message: "..." }
      if (backendErrors.message) {
        setSuccessMessage('') // Clear any leftover success
        setApiErrors({ non_field_errors: backendErrors.message })
      } else {
        setApiErrors(backendErrors)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setApiErrors({});
    setLoading(true);
    try {
      const userData = await googleLogin(credentialResponse.credential);
      handleLoginRedirect(userData);
    } catch (error) {
      console.error("Google Login Error:", error);
      const backendError = error.response?.data?.error || "Google authentication failed";
      setApiErrors({ google: backendError });
    } finally {
      setLoading(false);
    }
  };


  const inputBase =
    'w-full max-w-[420px] rounded-lg border border-[#6d6e70]/40 bg-white px-4 py-2.5 text-sm placeholder:text-[#6d6e70]/60 focus:border-[#6d6e70] focus:outline-none'

  return (
    <div className="theme-original">
      <div className="flex min-h-screen w-full items-center justify-center bg-secondary px-6 py-12 antialiased">
        <div className="w-full max-w-2xl">
          <div className="card-border bg-surface p-10 shadow-xl">
            <div className="mb-10 text-center">
              <img src={logo} alt="HCKonnect" className="mx-auto h-12 w-12 mb-6" />
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-2">Join HCKonnect</p>
              <h1 className="text-3xl font-display font-bold tracking-tight text-surface-dark">Create Your Account</h1>
              <p className="mt-3 text-sm text-surface-body leading-relaxed max-w-md mx-auto">One platform. Every community.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} className="w-full rounded-button border border-surface-border bg-secondary/30 px-4 py-3 text-sm text-surface-dark placeholder:text-surface-body focus:border-primary focus:ring-4 focus:ring-brand/10 focus:outline-none transition-all" wrapperClass="flex-1" error={errors.firstName || apiErrors.firstName} />
                <InputField name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} className="w-full rounded-button border border-surface-border bg-secondary/30 px-4 py-3 text-sm text-surface-dark placeholder:text-surface-body focus:border-primary focus:ring-4 focus:ring-brand/10 focus:outline-none transition-all" wrapperClass="flex-1" error={errors.lastName || apiErrors.lastName} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField name="username" placeholder="Username" value={formData.username} onChange={handleChange} className="w-full rounded-button border border-surface-border bg-secondary/30 px-4 py-3 text-sm text-surface-dark placeholder:text-surface-body focus:border-primary focus:ring-4 focus:ring-brand/10 focus:outline-none transition-all" wrapperClass="flex-1" error={errors.username || apiErrors.username} />
                <InputField type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full rounded-button border border-surface-border bg-secondary/30 px-4 py-3 text-sm text-surface-dark placeholder:text-surface-body focus:border-primary focus:ring-4 focus:ring-brand/10 focus:outline-none transition-all" wrapperClass="flex-1" error={errors.email || apiErrors.email} />
              </div>

              <div className="flex flex-col">
                <select name="course" value={formData.course} onChange={handleChange} className="w-full rounded-button border border-surface-border bg-secondary/30 px-4 py-3 text-sm text-surface-dark focus:border-primary focus:ring-4 focus:ring-brand/10 focus:outline-none transition-all appearance-none" >
                  <option value="">Select Your Course</option>
                  {COURSE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <FieldError message={errors.course || apiErrors.course} />
              </div>

              <div className="flex flex-col">
                <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-surface-body px-1">Select Your Interests</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {INTEREST_OPTIONS.map((interest) => (
                    <label
                      key={interest}
                      className={`flex cursor-pointer items-center gap-2 rounded-button border px-3 py-2 text-xs transition-all ${formData.interests.includes(interest) ? 'border-primary bg-primary/10 text-primary ring-1 ring-brand shadow-sm shadow-brand/10' : 'border-surface-border bg-secondary/30 text-surface-body hover:border-primary hover:bg-white'
                        }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={formData.interests.includes(interest)}
                        onChange={() => toggleInterest(interest)}
                      />
                      <span className="capitalize truncate leading-none">
                        {interest.replace(/_/g, ' ')}
                      </span>
                    </label>
                  ))}
                </div>
                <FieldError message={errors.interests || apiErrors.interests} />
              </div>

              {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-button bg-primary py-2.5 text-sm font-bold text-white transition hover:scale-[1.01] active:scale-[0.99] ${loading ? 'cursor-not-allowed opacity-70' : ''}`}
              >
                {loading ? 'Signing Up…' : 'Create Account'}
              </button>

              <Divider />

              <div className="w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    console.log('Login Failed');
                    setApiErrors({ google: "Google Login Failed" });
                  }}
                  theme="outline"
                  size="large"
                  shape="rectangular"
                  width="100%"
                />
                <FieldError message={apiErrors.google} />
              </div>

              <p className="text-center text-xs text-surface-body font-medium">
                Already have an account?{' '}
                <a href="/login" className="font-bold text-surface-dark hover:text-primary transition-colors underline decoration-brand decoration-2 underline-offset-4">
                  Sign In
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

function InputField({ type = 'text', name, placeholder, value, onChange, className, error, wrapperClass = '' }) {
  return (
    <div className={`flex flex-col items-center ${wrapperClass}`}>
      <input type={type} name={name} placeholder={placeholder} className={className} value={value} onChange={onChange} />
      <FieldError message={error} />
    </div>
  )
}


function FieldError({ message }) {
  if (!message) return null
  return <p className="mt-1 w-full max-w-[420px] text-left text-xs text-red-600">{Array.isArray(message) ? message.join(', ') : message}</p>
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

export default Register
