import { useState } from 'react'
import axios from 'axios'
import logo from '../../assets/logo.png'
import Toast from '../../components/others/Toast' // your component
import { useNavigate } from 'react-router-dom'



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


  const handleSubmit = async (event) => {
    event.preventDefault()
    setSuccessMessage('')
    setApiErrors({})
    if (!validate()) return

    try {
      setLoading(true)

      const payload = {
        username: formData.username,
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


  const inputBase =
    'w-full max-w-[420px] rounded-lg border border-[#6d6e70]/40 bg-white px-4 py-2.5 text-sm placeholder:text-[#6d6e70]/60 focus:border-[#6d6e70] focus:outline-none'

  return (
    <div className="flex min-h-screen w-full font-['Inter',sans-serif] text-[#111]">
      <div className="flex min-h-screen w-full bg-white">
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center lg:px-12">
          <Toast
            message={successMessage}
            onClose={() => setSuccessMessage('')}
            duration={10000} // 10 seconds
          />
          <div className="w-full max-w-[420px] space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-[#6d6e70]">Register</p>
              <h1 className="mt-3 text-3xl font-semibold text-[#74bf44]">Create an Account</h1>

              <p className="mt-2 text-sm text-[#6d6e70]">
                Join HCKonnect to access community events, discussions, and resources.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <InputField name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} className={inputBase} wrapperClass="flex-1" error={errors.firstName || apiErrors.firstName} />


                <InputField name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} className={inputBase} wrapperClass="flex-1" error={errors.lastName || apiErrors.lastName} />
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <InputField name="username" placeholder="Username" value={formData.username} onChange={handleChange} className={inputBase} wrapperClass="flex-1" error={errors.username || apiErrors.username} />
                <InputField type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className={inputBase} wrapperClass="flex-1" error={errors.email || apiErrors.email} />
              </div>

              <div className="flex flex-col items-center">

                <select name="course" value={formData.course} onChange={handleChange} className={`${inputBase} appearance-none`} >
                  <option value="">Select Course</option>
                  {COURSE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <FieldError message={errors.course || apiErrors.course} />
              </div>

              <div className="flex flex-col items-center">
                <p className="mb-2 w-full max-w-[420px] text-left text-sm font-medium text-[#6d6e70]">Interests</p>
                <div className="grid w-full max-w-[420px] gap-2 sm:grid-cols-2">
                  {INTEREST_OPTIONS.map((interest) => (
                    <label
                      key={interest}
                      className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm ${formData.interests.includes(interest) ? 'border-[#6d6e70] bg-[#f5f5f5]' : 'border-[#e0e0e0]'
                        }`}
                    >
                      <input
                        type="checkbox"
                        className="accent-[#6d6e70]"
                        checked={formData.interests.includes(interest)}
                        onChange={() => toggleInterest(interest)}
                      />
                      <span className="capitalize truncate" title={interest.replace(/_/g, ' ')}>
                        {interest.replace(/_/g, ' ')}
                      </span>

                    </label>

                  ))}
                </div>
                <FieldError message={errors.interests || apiErrors.interests} />
              </div>

              {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

              <button type="submit" disabled={loading}
                className={`w-full max-w-[420px] rounded-full bg-[#74bf44] py-2.5 text-sm font-semibold text-white transition hover:bg-[#62a837] ${loading ? 'cursor-not-allowed opacity-70' : ''}`}>

                {loading ? 'Signing Up…' : 'Sign Up'}
              </button>

              <Divider />

              <GoogleButton label="Sign In with Google" />

              <p className="text-xs text-[#6d6e70]">
                Already have an account?{' '}
                <a href="/login" className="font-semibold text-[#6d6e70] underline-offset-4 hover:underline">
                  Sign In
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

export default Register

