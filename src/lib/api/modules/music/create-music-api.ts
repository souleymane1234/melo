import { isMusicEngineConfigured } from '../../../../config/app-config'
import { MusicEngineUnavailableError, type MusicTrack } from '../../../music-types'
import type { HttpClient } from '../../ports/http-client.port'
import { MUSIC_API_PATHS, type MusicApiPaths } from './music.paths'
import {
  mapTrackDto,
  unwrapJobPayload,
  unwrapTrackList,
  unwrapTrackPayload,
  type GenerateMusicBodyDto,
} from './music.types'

const POLL_INTERVAL_MS = 2_000
const MAX_POLLS = 90

export interface MusicApi {
  generate(body: GenerateMusicBodyDto, signal?: AbortSignal): Promise<MusicTrack>
  listPublic(signal?: AbortSignal): Promise<MusicTrack[]>
  listMine(signal?: AbortSignal): Promise<MusicTrack[]>
  listReceived(signal?: AbortSignal): Promise<MusicTrack[]>
  getById(id: string, signal?: AbortSignal): Promise<MusicTrack | null>
}

function withId(template: string, id: string): string {
  return template.replace(':id', encodeURIComponent(id))
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException('Aborted', 'AbortError'))
      return
    }
    const timer = window.setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timer)
        reject(signal.reason ?? new DOMException('Aborted', 'AbortError'))
      },
      { once: true },
    )
  })
}

export function createMusicApi(
  http: HttpClient,
  paths: MusicApiPaths = MUSIC_API_PATHS,
): MusicApi {
  async function fetchJob(id: string, signal?: AbortSignal) {
    return http.request<unknown>({
      method: 'GET',
      path: withId(paths.job, id),
      signal,
    })
  }

  return {
    async generate(body, signal) {
      if (!isMusicEngineConfigured()) {
        throw new MusicEngineUnavailableError()
      }

      const payload = await http.request<unknown>({
        method: 'POST',
        path: paths.generate,
        body,
        signal,
      })

      const immediate = mapTrackDto(unwrapTrackPayload(payload) ?? {}, {
        title: body.title,
        prompt: body.prompt,
        genre: body.genre,
        mood: body.mood,
        voiceType: body.voiceType,
        language: body.language,
        lyricsMode: body.lyricsMode,
        lyrics: body.lyrics,
        durationSeconds: body.durationSeconds,
        recipient: body.recipient,
        status: 'completed',
      })
      if (immediate?.audioUrl && immediate.status === 'completed') {
        return immediate
      }

      const job = unwrapJobPayload(payload)
      const jobId = job.jobId ?? job.id
      if (!jobId) {
        throw new Error(
          job.message ??
            job.error ??
            'Le moteur n’a renvoyé ni fichier audio ni identifiant de génération.',
        )
      }

      for (let attempt = 0; attempt < MAX_POLLS; attempt += 1) {
        const snapshot = unwrapJobPayload(await fetchJob(jobId, signal))
        const status = String(snapshot.status ?? '').toLowerCase()
        const mapped = mapTrackDto(snapshot.track ?? unwrapTrackPayload(snapshot) ?? {}, {
          id: jobId,
          title: body.title,
          prompt: body.prompt,
          genre: body.genre,
          mood: body.mood,
          voiceType: body.voiceType,
          language: body.language,
          lyricsMode: body.lyricsMode,
          lyrics: body.lyrics,
          durationSeconds: body.durationSeconds,
          recipient: body.recipient,
        })

        if (mapped?.audioUrl && (status === 'completed' || status === 'success' || mapped.status === 'completed')) {
          return { ...mapped, status: 'completed' }
        }
        if (status === 'failed' || status === 'error') {
          throw new Error(snapshot.error ?? snapshot.message ?? 'La génération a échoué.')
        }
        await sleep(POLL_INTERVAL_MS, signal)
      }

      throw new Error('La génération prend trop de temps. Réessayez dans un instant.')
    },

    async listPublic(signal) {
      if (!isMusicEngineConfigured()) return []
      const payload = await http.request<unknown>({
        method: 'GET',
        path: paths.tracks,
        signal,
      })
      return unwrapTrackList(payload)
        .map((dto) => mapTrackDto(dto))
        .filter((track): track is MusicTrack => Boolean(track?.audioUrl))
    },

    async listMine(signal) {
      if (!isMusicEngineConfigured()) return []
      const payload = await http.request<unknown>({
        method: 'GET',
        path: paths.myTracks,
        signal,
      })
      return unwrapTrackList(payload)
        .map((dto) => mapTrackDto(dto))
        .filter((track): track is MusicTrack => Boolean(track?.audioUrl))
    },

    async listReceived(signal) {
      if (!isMusicEngineConfigured()) return []
      const payload = await http.request<unknown>({
        method: 'GET',
        path: paths.receivedTracks,
        signal,
      })
      return unwrapTrackList(payload)
        .map((dto) => mapTrackDto(dto))
        .filter((track): track is MusicTrack => Boolean(track?.audioUrl))
    },

    async getById(id, signal) {
      if (!isMusicEngineConfigured()) return null
      const payload = await http.request<unknown>({
        method: 'GET',
        path: withId(paths.track, id),
        signal,
      })
      return mapTrackDto(unwrapTrackPayload(payload) ?? { id })
    },
  }
}
