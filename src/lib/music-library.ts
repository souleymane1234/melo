import type { MusicTrack } from './music-types'

const LIBRARY_KEY = 'lyria-library'
const RECEIVED_KEY = 'lyria-received'
const LIBRARY_EVENT = 'lyria-library-changed'

function notify(): void {
  window.dispatchEvent(new Event(LIBRARY_EVENT))
}

export function getMusicLibraryEventName(): string {
  return LIBRARY_EVENT
}

function isStoredTrack(value: unknown): value is MusicTrack {
  if (!value || typeof value !== 'object') return false
  const track = value as Partial<MusicTrack>
  return Boolean(track.id && track.title && track.audioUrl && track.status === 'completed')
}

function readStore(key: string): MusicTrack[] {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isStoredTrack).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  } catch {
    return []
  }
}

function writeStore(key: string, tracks: MusicTrack[]): void {
  window.localStorage.setItem(key, JSON.stringify(tracks))
  notify()
}

export function readLocalTracks(): MusicTrack[] {
  return readStore(LIBRARY_KEY)
}

export function saveLocalTrack(track: MusicTrack): MusicTrack {
  writeStore(LIBRARY_KEY, [track, ...readLocalTracks().filter((item) => item.id !== track.id)])
  return track
}

export function getLocalTrack(id: string): MusicTrack | null {
  return readLocalTracks().find((item) => item.id === id) ?? null
}

export function readReceivedTracks(): MusicTrack[] {
  return readStore(RECEIVED_KEY)
}

export function saveReceivedTrack(track: MusicTrack): void {
  const existing = readReceivedTracks()
  if (existing.some((item) => item.id === track.id)) return
  writeStore(RECEIVED_KEY, [track, ...existing])
}

export function getReceivedTrack(id: string): MusicTrack | null {
  return readReceivedTracks().find((item) => item.id === id) ?? null
}
