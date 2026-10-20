import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { isMusicEngineConfigured, MUSIC_GENERATION_LIVE } from '../config/app-config'
import { ApiHttpError } from '../lib/api'
import { isApiLoggedIn } from '../lib/auth-session'
import { saveLocalTrack } from '../lib/music-library'
import { displayedStatus } from '../lib/song-delivery'
import {
  MusicEngineUnavailableError,
  type GenerateMusicInput,
  type MusicTrack,
  type MusicTrackStatus,
} from '../lib/music-types'
import { musicApi } from '../services/api-client'

const musicQueryKeys = {
  public: ['music', 'public'] as const,
  mine: ['music', 'mine'] as const,
  received: ['music', 'received'] as const,
  detail: (id: string) => ['music', 'detail', id] as const,
  job: (id: string) => ['music', 'job', id] as const,
}

const JOB_REFRESH_MS = MUSIC_GENERATION_LIVE ? 60_000 : 5 * 60_000

function isInProgress(status: MusicTrackStatus | undefined): boolean {
  return status === 'pending' || status === 'processing'
}

export function usePublicTracksQuery() {
  return useQuery({
    queryKey: musicQueryKeys.public,
    queryFn: ({ signal }) => musicApi.listPublic(signal),
    enabled: isMusicEngineConfigured(),
    staleTime: 60_000,
  })
}

export function useMyTracksQuery(enabled: boolean) {
  return useQuery({
    queryKey: musicQueryKeys.mine,
    queryFn: ({ signal }) => musicApi.listMine(signal),
    enabled: enabled && isMusicEngineConfigured(),
    staleTime: 30_000,
    refetchInterval: (query) =>
      MUSIC_GENERATION_LIVE &&
      query.state.data?.some((track) => track.status === 'pending' || track.status === 'processing')
        ? 10_000
        : false,
  })
}

export function useReceivedTracksQuery(enabled: boolean) {
  return useQuery({
    queryKey: musicQueryKeys.received,
    queryFn: ({ signal }) => musicApi.listReceived(signal),
    enabled: enabled && isMusicEngineConfigured(),
    staleTime: 30_000,
  })
}

export function useTrackQuery(id: string | undefined) {
  return useQuery({
    queryKey: musicQueryKeys.detail(id ?? ''),
    queryFn: ({ signal }) => musicApi.getById(id ?? '', signal),
    enabled: Boolean(id) && isMusicEngineConfigured(),
  })
}

/** Suit l’état de génération d’une chanson pas encore terminée et rafraîchit la liste quand il change. */
export function useTrackJobQuery(track: MusicTrack) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: musicQueryKeys.job(track.id),
    queryFn: ({ signal }) => musicApi.getJob(track.id, signal),
    enabled:
      track.source === 'api' &&
      isInProgress(displayedStatus(track.status, track.deliveryStatus, track.audioUrl)) &&
      isApiLoggedIn() &&
      isMusicEngineConfigured(),
    staleTime: 30_000,
    refetchInterval: (q) => {
      const job = q.state.data
      if (!job) return false
      const delivery = job.track?.deliveryStatus ?? track.deliveryStatus
      const audioUrl = job.track?.audioUrl ?? track.audioUrl
      return isInProgress(displayedStatus(job.status, delivery, audioUrl)) ? JOB_REFRESH_MS : false
    },
  })

  const jobStatus = query.data?.status
  useEffect(() => {
    if (jobStatus && jobStatus !== track.status) {
      void queryClient.invalidateQueries({ queryKey: musicQueryKeys.mine })
    }
  }, [jobStatus, track.status, queryClient])

  return query
}

export function useGenerateMusicMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: GenerateMusicInput) => {
      if (!isMusicEngineConfigured()) {
        throw new MusicEngineUnavailableError()
      }
      return musicApi.generate(input, { follow: MUSIC_GENERATION_LIVE })
    },
    onSuccess: (track) => {
      if (track.audioUrl && track.status === 'completed') {
        saveLocalTrack({ ...track, source: 'local' })
      }
      void queryClient.invalidateQueries({ queryKey: musicQueryKeys.mine })
      void queryClient.invalidateQueries({ queryKey: musicQueryKeys.public })
    },
  })
}

export function musicErrorMessage(error: unknown): string {
  if (error instanceof MusicEngineUnavailableError) return error.message
  if (ApiHttpError.isInstance(error)) {
    if (error.status === 0) {
      return 'Impossible de joindre le moteur de génération. Vérifiez la connexion, puis réessayez.'
    }
    if (error.status === 401) {
      return 'Votre session a expiré. Reconnectez-vous pour envoyer la chanson.'
    }
    if (error.status === 403) {
      return error.message || 'Un abonnement actif est nécessaire, ou votre quota de chansons est atteint.'
    }
    if (error.status === 404) {
      return 'Le service de génération n’est pas disponible sur l’API configurée.'
    }
    return error.message
  }
  if (error instanceof Error) return error.message
  return 'Une erreur inattendue est survenue pendant la génération.'
}
