import { createFetchHttpClient } from './adapters/fetch-http-client'
import { buildApiEnvironment, type ApiEnvironment } from './config/api-environment'
import type { HttpClient } from './ports/http-client.port'
import type { TokenProvider } from './ports/token-provider.port'

function readEnvString(key: string): string | undefined {
  const value = import.meta.env[key as keyof ImportMetaEnv]
  if (typeof value !== 'string' || value.trim() === '') return undefined
  return value.trim()
}

export function createAppHttpClient(options?: {
  environment?: Partial<ApiEnvironment>
  defaultHeaders?: Record<string, string>
  getToken?: TokenProvider
  refreshAccessToken?: () => Promise<string | null>
  /** Client sans Bearer (login / refresh). */
  skipAuth?: boolean
}): HttpClient {
  const environment = buildApiEnvironment(options?.environment)

  const fromEnv: Record<string, string> = {}
  const apiKey = readEnvString('VITE_API_KEY')
  if (apiKey) {
    fromEnv['X-Api-Key'] = apiKey
  }

  return createFetchHttpClient({
    environment,
    defaultHeaders: { ...fromEnv, ...options?.defaultHeaders },
    getToken: options?.skipAuth ? undefined : options?.getToken,
    refreshAccessToken: options?.skipAuth ? undefined : options?.refreshAccessToken,
  })
}
