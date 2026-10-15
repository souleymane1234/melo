function readEnvString(key: string): string | undefined {
  const value = import.meta.env[key as keyof ImportMetaEnv]
  if (typeof value !== 'string' || value.trim() === '') return undefined
  return value.trim()
}

export const MUSIC_API_PATHS = {
  generate: readEnvString('VITE_MUSIC_GENERATE_PATH') ?? '/api/v1/music/generate',
  job: readEnvString('VITE_MUSIC_JOB_PATH') ?? '/api/v1/music/jobs/:id',
  tracks: readEnvString('VITE_MUSIC_TRACKS_PATH') ?? '/api/v1/music/tracks',
  myTracks: readEnvString('VITE_MUSIC_MY_TRACKS_PATH') ?? '/api/v1/music/me/tracks',
  receivedTracks: readEnvString('VITE_MUSIC_RECEIVED_PATH') ?? '/api/v1/music/me/received',
  track: '/api/v1/music/tracks/:id',
} as const

export type MusicApiPaths = typeof MUSIC_API_PATHS
