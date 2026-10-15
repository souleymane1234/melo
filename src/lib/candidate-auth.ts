const SESSION_KEY = 'wsci-candidate-session'
const AUTH_EVENT = 'wsci-auth-changed'

function notifyAuthChanged(): void {
  window.dispatchEvent(new Event(AUTH_EVENT))
}

export function getAuthEventName(): string {
  return AUTH_EVENT
}

export function isCandidateLoggedIn(): boolean {
  return (
    window.localStorage.getItem(SESSION_KEY) === '1' ||
    Boolean(window.localStorage.getItem('wsci-access-token'))
  )
}

export function logoutCandidate(): void {
  window.localStorage.removeItem(SESSION_KEY)
  window.localStorage.removeItem('wsci-access-token')
  window.localStorage.removeItem('wsci-refresh-token')
  window.localStorage.removeItem('wsci-auth-user')
  // Aligné avec clearAuthSession (JWT)
  notifyAuthChanged()
}
