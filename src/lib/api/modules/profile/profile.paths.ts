export const PROFILE_API_PATHS = {
  me: '/api/v1/profile/me',
} as const

export type ProfileApiPaths = typeof PROFILE_API_PATHS
