import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isMusicEngineConfigured } from '../config/app-config'
import { ApiHttpError } from '../lib/api'
import { saveLocalTrack } from '../lib/music-library'
import { MusicEngineUnavailableError, type GenerateMusicInput } from '../lib/music-types'
import { musicApi } from '../services/api-client'

const musicQueryKeys = {
  public: ['music', 'public'] as const,
  mine: ['music', 'mine'] as const,
  received: ['music', 'received'] as const,
  detail: (id: string) => ['music', 'detail', id] as const,
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

export function useGenerateMusicMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: GenerateMusicInput) => {
      if (!isMusicEngineConfigured()) {
        throw new MusicEngineUnavailableError()
      }
      return musicApi.generate(input)
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
    if (error.status === 404) {
      return 'Le service de génération n’est pas disponible sur l’API configurée.'
    }
    return error.message
  }
  if (error instanceof Error) return error.message
  return 'Une erreur inattendue est survenue pendant la génération.'
}
