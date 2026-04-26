import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './features/authentication/components/AuthContext.jsx'
import { ToastProvider } from './shared/components/ui/ToastContext.jsx'
import { initializeTheme, ThemeProvider } from './shared/context/ThemeContext.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
initializeTheme()

ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={googleClientId}>
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>
)
