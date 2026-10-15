export const AUTH_API_PATHS = {
  login: '/api/v1/auth/login',
  /** Inscription immédiate (email vérifié, tokens renvoyés). */
  register: '/api/v1/auth/register-without-confirm',
  refresh: '/api/v1/auth/refresh',
} as const

export type AuthApiPaths = typeof AUTH_API_PATHS
