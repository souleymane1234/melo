import { MUSIC_API_BASE_URL } from '../config/app-config'
import { createAppHttpClient } from '../lib/api/create-app-http-client'
import { createAuthApi } from '../lib/api/modules/auth'
import { createMusicApi } from '../lib/api/modules/music'
import { createProfileApi } from '../lib/api/modules/profile'
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  setAuthSession,
} from '../lib/auth-session'

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null
  try {
    // Client sans refresh récursif pour éviter une boucle 401.
    const bare = createAppHttpClient({ skipAuth: true })
    const auth = createAuthApi(bare)
    const res = await auth.refresh({ refreshToken })
    const accessToken = res.data.accessToken
    if (!accessToken) return null
    setAuthSession({
      accessToken,
      refreshToken: res.data.refreshToken ?? refreshToken,
    })
    return accessToken
  } catch {
    clearAuthSession()
    return null
  }
}

const httpClient = createAppHttpClient({
  getToken: getAccessToken,
  refreshAccessToken,
})

export const authApi = createAuthApi(httpClient)
export const profileApi = createProfileApi(httpClient)

const musicHttpClient = createAppHttpClient({
  getToken: getAccessToken,
  refreshAccessToken,
  environment: {
    timeoutMs: 180_000,
    ...(MUSIC_API_BASE_URL ? { baseUrl: MUSIC_API_BASE_URL } : {}),
  },
})

export const musicApi = createMusicApi(musicHttpClient)
