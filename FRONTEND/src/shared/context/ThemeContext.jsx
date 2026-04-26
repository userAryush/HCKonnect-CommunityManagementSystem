import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import apiClient from '../services/apiClient'

const ThemeContext = createContext(null)
const THEME_STORAGE_KEY = 'hck-theme'
const VALID_THEMES = ['light', 'dark']
const LIGHT_ONLY_ROUTES = new Set(['/', '/login', '/register', '/signup'])

const isValidTheme = (value) => VALID_THEMES.includes(value)
const isLightOnlyRoute = (pathname = '') => LIGHT_ONLY_ROUTES.has(pathname)

const getSystemTheme = () => {
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

const getStoredTheme = () => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  return isValidTheme(savedTheme) ? savedTheme : null
}

const applyThemeClass = (theme) => {
  const root = document.documentElement
  const isDark = theme === 'dark'
  root.classList.toggle('dark', isDark)
  root.setAttribute('data-theme', theme)
}

const getInitialTheme = () => {
  if (typeof window !== 'undefined' && isLightOnlyRoute(window.location?.pathname)) {
    return 'light'
  }
  return getStoredTheme() || getSystemTheme()
}

export const initializeTheme = () => {
  const theme = getInitialTheme()
  applyThemeClass(theme)
  localStorage.setItem(THEME_STORAGE_KEY, theme)
}

export function ThemeProvider({ children }) {
  const location = useLocation()
  const [theme, setTheme] = useState(getInitialTheme)
  const [isThemeSyncing, setIsThemeSyncing] = useState(false)
  const isForcedLightRoute = isLightOnlyRoute(location.pathname)

  const persistTheme = (nextTheme) => {
    applyThemeClass(nextTheme)
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    setTheme(nextTheme)
  }

  const updateThemeInBackend = async (nextTheme) => {
    const accessToken = localStorage.getItem('access_token')
    if (!accessToken) return
    await apiClient.patch('/api/user/theme/', { theme: nextTheme })
  }

  useEffect(() => {
    const activeTheme = isForcedLightRoute ? 'light' : theme
    applyThemeClass(activeTheme)
    if (!isForcedLightRoute) {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    }
  }, [theme, isForcedLightRoute])

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token')
    if (!accessToken) return

    const syncThemeFromBackend = async () => {
      setIsThemeSyncing(true)
      try {
        const response = await apiClient.get('/api/user/theme/')
        const serverTheme = response?.data?.theme
        if (isValidTheme(serverTheme) && serverTheme !== theme) {
          persistTheme(serverTheme)
        }
      } catch (error) {
        console.error('Failed to sync theme from backend', error)
      } finally {
        setIsThemeSyncing(false)
      }
    }

    syncThemeFromBackend()
    // Intentionally run once on mount for initial backend sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setThemePreference = async (nextTheme, options = {}) => {
    const { syncBackend = true } = options
    if (!isValidTheme(nextTheme)) return

    persistTheme(nextTheme)
    if (!syncBackend) return

    try {
      await updateThemeInBackend(nextTheme)
    } catch (error) {
      console.error('Failed to persist theme preference', error)
    }
  }

  const toggleTheme = async () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    await setThemePreference(nextTheme)
  }

  const resetThemeToGuestPreference = () => {
    const guestTheme = getSystemTheme()
    persistTheme(guestTheme)
  }

  const value = useMemo(() => ({
    theme,
    isDark: theme === 'dark',
    isThemeSyncing,
    setTheme: setThemePreference,
    setThemePreference,
    toggleTheme,
    resetThemeToGuestPreference,
  }), [theme, isThemeSyncing])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
