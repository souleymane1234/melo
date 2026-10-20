import { isMusicEngineConfigured } from '../../../../config/app-config'
import { MusicEngineUnavailableError, type MusicJobState, type MusicTrack } from '../../../music-types'
import type { HttpClient } from '../../ports/http-client.port'
import { MUSIC_API_PATHS, type MusicApiPaths } from './music.paths'
import {
  mapTrackDto,
  normalizeStatus,
  unwrapJobPayload,
  unwrapTrackList,
  unwrapTrackPayload,
  type GenerateMusicBodyDto,
} from './music.types'

const POLL_INTERVAL_MS = 3_000
const MAX_POLLS = 100
const LIST_PAGE_SIZE = 50

export interface GenerateOptions {
  /** `false` : renvoie la demande enregistrée sans attendre la fin de la génération. */
  follow?: boolean
  signal?: AbortSignal
}

export interface MusicApi {
  /**
   * Lance la création puis suit le job. Renvoie la chanson terminée, ou son état courant
   * (`pending` / `processing`) si le suivi dépasse le délai : la génération continue côté serveur.
   */
  generate(body: GenerateMusicBodyDto, options?: GenerateOptions): Promise<MusicTrack>
  listPublic(signal?: AbortSignal): Promise<MusicTrack[]>
  listMine(signal?: AbortSignal): Promise<MusicTrack[]>
  listReceived(signal?: AbortSignal): Promise<MusicTrack[]>
  getById(id: string, signal?: AbortSignal): Promise<MusicTrack | null>
  /** État de génération d’une chanson (créateur uniquement) ; `id` = identifiant de la chanson. */
  getJob(id: string, signal?: AbortSignal): Promise<MusicJobState>
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
  async function list(path: string, signal?: AbortSignal): Promise<MusicTrack[]> {
    if (!isMusicEngineConfigured()) return []
    const payload = await http.request<unknown>({
      method: 'GET',
      path,
      query: { page: 1, per_page: LIST_PAGE_SIZE },
      signal,
    })
    return unwrapTrackList(payload)
      .map((dto) => mapTrackDto(dto))
      .filter((track): track is MusicTrack => Boolean(track))
  }

  return {
    async generate(body, { follow = true, signal } = {}) {
      if (!isMusicEngineConfigured()) {
        throw new MusicEngineUnavailableError()
      }

      const payload = await http.request<unknown>({
        method: 'POST',
        path: paths.generate,
        body,
        signal,
      })

      const fallback: Partial<MusicTrack> = { ...body, status: 'pending' }
      const created = unwrapTrackPayload(payload)
      let current = mapTrackDto(created ?? {}, fallback)
      if (current?.audioUrl && current.status === 'completed') return current
      if (!follow && current) return current

      const job = unwrapJobPayload(payload)
      const jobId = created?.jobId ?? job.jobId ?? job.id
      if (!jobId) {
        throw new Error(job.message ?? job.error ?? 'Le serveur n’a pas renvoyé d’identifiant de création.')
      }

      for (let attempt = 0; attempt < MAX_POLLS; attempt += 1) {
        await sleep(POLL_INTERVAL_MS, signal)
        const snapshot = unwrapJobPayload(
          await http.request<unknown>({ method: 'GET', path: withId(paths.job, jobId), signal }),
        )
        const status = String(snapshot.status ?? '').toLowerCase()
        current = mapTrackDto(snapshot.track ?? {}, { ...fallback, ...current }) ?? current

        if (status === 'failed' || current?.status === 'failed') {
          throw new Error(snapshot.error ?? current?.error ?? 'La génération a échoué.')
        }
        if (current?.audioUrl && (status === 'completed' || current.status === 'completed')) {
          return { ...current, status: 'completed' }
        }
      }

      if (current) return { ...current, status: 'processing' }
      throw new Error('La génération prend plus de temps que prévu. Suivez-la dans Mon espace.')
    },

    listPublic(signal) {
      return list(paths.tracks, signal).then((tracks) => tracks.filter((track) => track.audioUrl))
    },

    listMine(signal) {
      return list(paths.myTracks, signal)
    },

    listReceived(signal) {
      return list(paths.receivedTracks, signal).then((tracks) => tracks.filter((track) => track.audioUrl))
    },

    async getJob(id, signal) {
      const job = unwrapJobPayload(
        await http.request<unknown>({ method: 'GET', path: withId(paths.job, id), signal }),
      )
      const track = job.track ? mapTrackDto(job.track) : null
      return {
        jobId: job.jobId ?? id,
        status: normalizeStatus(job.status ?? track?.status ?? undefined),
        error: job.error ?? track?.error ?? undefined,
        track,
      }
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
