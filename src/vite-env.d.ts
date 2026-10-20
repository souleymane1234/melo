/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_API_TIMEOUT_MS?: string
  readonly VITE_API_ACCEPT_LANGUAGE?: string
  readonly VITE_API_KEY?: string
  readonly VITE_MUSIC_ENGINE_ENABLED?: string
  readonly VITE_MUSIC_API_BASE_URL?: string
  readonly VITE_MUSIC_GENERATE_PATH?: string
  readonly VITE_MUSIC_JOB_PATH?: string
  readonly VITE_MUSIC_TRACKS_PATH?: string
  readonly VITE_MUSIC_MY_TRACKS_PATH?: string
  readonly VITE_MUSIC_RECEIVED_PATH?: string
  readonly VITE_MUSIC_GENERATION_LIVE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
