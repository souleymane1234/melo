const ACCESS_TOKEN_KEY = 'wsci-access-token'
const REFRESH_TOKEN_KEY = 'wsci-refresh-token'
const AUTH_USER_KEY = 'wsci-auth-user'
const AUTH_EVENT = 'wsci-auth-changed'

export type AuthUser = {
  id?: string
  email: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  profileImage?: string
  studentProfileId?: string
  bio?: string
  city?: string
  country?: string
  address?: string
  gender?: string
  nationality?: string
  dateOfBirth?: string
  academicLevel?: string
}

function notifyAuthChanged(): void {
  window.dispatchEvent(new Event(AUTH_EVENT))
}

export function getAuthEventName(): string {
  return AUTH_EVENT
}

export function getAccessToken(): string | null {
  try {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY)
  } catch {
    return null
  }
}

export function getRefreshToken(): string | null {
  try {
    return window.localStorage.getItem(REFRESH_TOKEN_KEY)
  } catch {
    return null
  }
}

export function getAuthUser(): AuthUser | null {
  try {
    const raw = window.localStorage.getItem(AUTH_USER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function isApiLoggedIn(): boolean {
  return Boolean(getAccessToken())
}

export function setAuthSession(input: {
  accessToken: string
  refreshToken?: string | null
  user?: AuthUser | null
}): void {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, input.accessToken)
  if (input.refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, input.refreshToken)
  }
  if (input.user) {
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(input.user))
  }
  // Compat avec l’ancien flag session candidat (Navbar / ConcoursPage)
  window.localStorage.setItem('wsci-candidate-session', '1')
  notifyAuthChanged()
}

export function clearAuthSession(): void {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_KEY)
  window.localStorage.removeItem(AUTH_USER_KEY)
  window.localStorage.removeItem('wsci-candidate-session')
  notifyAuthChanged()
}
