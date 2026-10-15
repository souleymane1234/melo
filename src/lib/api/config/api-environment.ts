export interface ApiEnvironment {
  baseUrl: string
  timeoutMs: number
  acceptLanguage: string
}

function readEnvString(key: string): string | undefined {
  const value = import.meta.env[key as keyof ImportMetaEnv]
  if (typeof value !== 'string' || value.trim() === '') return undefined
  return value.trim()
}

function readEnvInt(key: string, fallback: number): number {
  const raw = readEnvString(key)
  if (raw === undefined) return fallback
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '')
}

export function buildApiEnvironment(overrides?: Partial<ApiEnvironment>): ApiEnvironment {
  const baseUrlRaw = overrides?.baseUrl ?? import.meta.env.VITE_API_BASE_URL ?? ''

  const timeoutMs = overrides?.timeoutMs ?? readEnvInt('VITE_API_TIMEOUT_MS', 30_000)

  const acceptLanguage =
    overrides?.acceptLanguage ??
    readEnvString('VITE_API_ACCEPT_LANGUAGE') ??
    'fr-FR,fr;q=0.9,*;q=0.8'

  return {
    baseUrl: normalizeBaseUrl(baseUrlRaw),
    timeoutMs,
    acceptLanguage,
  }
}
