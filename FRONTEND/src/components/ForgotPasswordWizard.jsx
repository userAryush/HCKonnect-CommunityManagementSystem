import { useState } from 'react'
import axios from 'axios'

// Reuse styles from Login page for consistency
const inputBase =
  'w-full rounded-lg border border-[#6d6e70]/40 bg-white px-4 py-2.5 text-sm placeholder:text-[#6d6e70]/60 focus:border-[#6d6e70] focus:outline-none'

const buttonBase =
  'w-full rounded-full bg-[#74bf44] py-2.5 text-sm font-semibold text-white transition hover:bg-[#62a837] disabled:cursor-not-allowed disabled:opacity-70'

const API_BASE_URL = 'http://localhost:8000'

export default function ForgotPasswordWizard({ onClose }) {
  const [step, setStep] = useState('email') //  email, otp, reset, success
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Email is required')
      return
    }


    try {
      setLoading(true)
      await axios.post(`${API_BASE_URL}/accounts/forgot-password/`, { email })
      setSuccessMsg('OTP sent to your email')
      setTimeout(() => {
        setSuccessMsg('')
        setStep('otp')
      }, 1000)
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
    finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')

    if (!otp || otp.length < 6) {
      setError('Please enter a valid 6-digit OTP.')
      return
    }

    try {
      setLoading(true)
      await axios.post(`${API_BASE_URL}/accounts/verify-otp/`, { email, otp })
      setSuccessMsg('OTP Verified Successfully')
      setTimeout(() => {
        setSuccessMsg('')
        setStep('reset')
      }, 1000)
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
    finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')

    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    try {
      setLoading(true)
      await axios.post(`${API_BASE_URL}/accounts/reset-password/`, { email, new_password: newPassword })
      setStep('success')
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
    finally {
      setLoading(false)
    }
  }


  const handleResendOtp = async () => {
    setError('')
    setSuccessMsg('')

    try {
      setLoading(true)
      await axios.post(`${API_BASE_URL}/accounts/forgot-password/`, {
        email,
        type: 'resend',
      })
      setSuccessMsg('OTP resent successfully')
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
    finally {
      setLoading(false)
    }
  }

  const getApiErrorMessage = (err) => {
    if (!err || !err.response || !err.response.data) {
      return 'Server not reachable. Please try again.'
    }

    const data = err.response.data

    // 🔥 CASE 1: Array response (YOUR CASE)
    if (Array.isArray(data)) {
      return data[0]
    }

    // CASE 2: Plain string
    if (typeof data === 'string') {
      return data
    }

    // CASE 3: DRF standard
    if (data.detail) {
      return data.detail
    }

    // CASE 4: Custom message
    if (data.message) {
      return data.message
    }

    // CASE 5: ValidationError("msg")
    if (Array.isArray(data.non_field_errors)) {
      return data.non_field_errors[0]
    }

    // CASE 6: Field-level errors
    const firstKey = Object.keys(data)[0]
    if (Array.isArray(data[firstKey])) {
      return data[firstKey][0]
    }

    return 'Unexpected error occurred.'
  }


  // Modal Backdrop
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="bg-[#f4f5f2] px-6 py-4 border-b border-[#e5e7eb] flex justify-between items-center">
          <h3 className="text-lg font-semibold text-[#0d1f14]">Reset Password</h3>
          <button onClick={onClose} className="text-[#6d6e70] hover:text-[#0d1f14] font-bold text-xl">&times;</button>
        </div>

        {/* Body */}
        <div className="p-6">

          {/* Step 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <h5 className="text-lg font-semibold text-[#74bf44] text-center">Forgot your password?</h5>
              <p className="text-sm text-[#6d6e70] text-center mb-4">Don’t worry! We are here to help you. Enter your email address below to reset your password.</p>
              <div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={inputBase}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              {error && <p className="text-xs text-red-600 text-center">{error}</p>}
              {successMsg && <p className="text-xs text-green-600 text-center">{successMsg}</p>}

              <button type="submit" disabled={loading} className={buttonBase}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          )}

          {/* Step 2: Verify OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-sm text-[#6d6e70] text-center mb-4">Enter the 6-digit OTP sent to <strong>{email}</strong></p>
              <div>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  className={`${inputBase} text-center tracking-widest text-lg`}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={loading}
                />
              </div>

              {error && <p className="text-xs text-red-600 text-center">{error}</p>}
              {successMsg && <p className="text-xs text-green-600 text-center">{successMsg}</p>}

              <button type="submit" disabled={loading} className={buttonBase}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <div className="flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-[#74bf44] hover:underline disabled:opacity-50"
                >
                  Resend OTP
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOtp('')
                    setStep('email')
                  }}
                  className="text-[#6d6e70] hover:underline"
                >
                  Change email
                </button>
              </div>

            </form>
          )}

          {/* Step 3: Reset Password */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-sm text-[#6d6e70] text-center mb-4">Create a new password for your account.</p>

              <div className="space-y-3">
                <input
                  type="password"
                  placeholder="New Password"
                  className={inputBase}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className={inputBase}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              {error && <p className="text-xs text-red-600 text-center">{error}</p>}

              <button type="submit" disabled={loading} className={buttonBase}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          {/* Success State */}
          {step === 'success' && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-3xl">
                🎉
              </div>
              <div>
                <h4 className="text-xl font-bold text-[#0d1f14]">Password Reset!</h4>
                <p className="text-sm text-[#6d6e70] mt-2">Your password has been successfully updated. You can now login with your new credentials.</p>
              </div>
              <button
                onClick={onClose}
                className={buttonBase}
              >
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
