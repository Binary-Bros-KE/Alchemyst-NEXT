// Auth utility functions
const AUTH_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  LOGIN_TIME: 'loginTime',
  EXPIRY_HOURS: 'expiryHours',
  REMEMBER_ME: 'rememberMe'
} as const

interface User {
  id: string
  email: string
  username: string
  userType: string
  [key: string]: unknown
}

interface AuthData {
  token: string | null
  user: User | null
  loginTime: string | null
  expiryHours: number | null
  rememberMe: boolean
}

// Save auth data to localStorage
export const saveAuthData = (token: string, user: User, rememberMe = false): void => {
  const loginTime = new Date().toISOString()
  const expiryHours = rememberMe ? 7 * 24 : 24 // 7 days or 24 hours

  localStorage.setItem(AUTH_KEYS.TOKEN, token)
  localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user))
  localStorage.setItem(AUTH_KEYS.LOGIN_TIME, loginTime)
  localStorage.setItem(AUTH_KEYS.EXPIRY_HOURS, expiryHours.toString())
  localStorage.setItem(AUTH_KEYS.REMEMBER_ME, rememberMe.toString())
}

// Get auth data from localStorage
export const getAuthData = (): AuthData => {
  const token = localStorage.getItem(AUTH_KEYS.TOKEN)
  const rawUser = localStorage.getItem(AUTH_KEYS.USER)

  let user: User | null = null
  try {
    if (rawUser && rawUser !== "undefined" && rawUser !== "null") {
      user = JSON.parse(rawUser)
    }
  } catch {
    console.warn("Invalid user data in storage, clearing...")
    localStorage.removeItem(AUTH_KEYS.USER)
  }

  const loginTime = localStorage.getItem(AUTH_KEYS.LOGIN_TIME)
  const expiryHours = localStorage.getItem(AUTH_KEYS.EXPIRY_HOURS)
  const rememberMe = localStorage.getItem(AUTH_KEYS.REMEMBER_ME)

  return {
    token,
    user,
    loginTime,
    expiryHours: expiryHours ? parseInt(expiryHours) : null,
    rememberMe: rememberMe === 'true'
  }
}

// Check if token is expired
export const isTokenExpired = (): boolean => {
  const { loginTime, expiryHours } = getAuthData()

  if (!loginTime || !expiryHours) return true

  const loginDate = new Date(loginTime)
  const expiryDate = new Date(loginDate.getTime() + (expiryHours * 60 * 60 * 1000))
  const now = new Date()

  return now > expiryDate
}

// Clear auth data
export const clearAuthData = (): void => {
  localStorage.removeItem(AUTH_KEYS.TOKEN)
  localStorage.removeItem(AUTH_KEYS.USER)
  localStorage.removeItem(AUTH_KEYS.LOGIN_TIME)
  localStorage.removeItem(AUTH_KEYS.EXPIRY_HOURS)
  localStorage.removeItem(AUTH_KEYS.REMEMBER_ME)
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const { token, user } = getAuthData()

  if (!token || !user) return false
  if (isTokenExpired()) {
    clearAuthData()
    return false
  }

  return true
}

// Get current user
export const getCurrentUser = (): User | null => {
  if (!isAuthenticated()) return null
  return getAuthData().user
}

// Auto-check token expiration (call this in your main App component)
export const initAuthCheck = (): void => {
  const { token, user } = getAuthData()

  // If token or user missing/corrupted — just clear it
  if (!token || !user) {
    clearAuthData()
  }
}
