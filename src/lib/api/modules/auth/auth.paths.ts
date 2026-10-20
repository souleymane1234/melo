export const AUTH_API_PATHS = {
  phoneSendCode: '/api/v1/auth/phone/send-code',
  phoneVerifyCode: '/api/v1/auth/phone/verify-code',
  refresh: '/api/v1/auth/refresh',
  logout: '/api/v1/auth/logout',
} as const

export type AuthApiPaths = typeof AUTH_API_PATHS
