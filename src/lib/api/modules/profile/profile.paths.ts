export const PROFILE_API_PATHS = {
  user: '/api/v1/profile/user',
} as const

export type ProfileApiPaths = typeof PROFILE_API_PATHS
