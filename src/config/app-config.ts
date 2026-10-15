function readEnvString(key: string): string | undefined {
  const value = import.meta.env[key as keyof ImportMetaEnv]
  if (typeof value !== 'string' || value.trim() === '') return undefined
  return value.trim()
}

export const APP_NAME = 'WorldSkills Côte d’Ivoire'

/** Active les appels au moteur musical uniquement si l’intégration est explicitement armée. */
const MUSIC_ENGINE_ENABLED = readEnvString('VITE_MUSIC_ENGINE_ENABLED') === 'true'

export const MUSIC_API_BASE_URL = readEnvString('VITE_MUSIC_API_BASE_URL')

export function isMusicEngineConfigured(): boolean {
  const base = MUSIC_API_BASE_URL ?? readEnvString('VITE_API_BASE_URL')
  return MUSIC_ENGINE_ENABLED && Boolean(base)
}
