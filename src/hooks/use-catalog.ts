import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import type { CatalogDto, CatalogOptionDto } from '../lib/api/modules/catalog'
import {
  MUSIC_DURATIONS,
  MUSIC_GENRES,
  MUSIC_LANGUAGES,
  MUSIC_MOODS,
  MUSIC_VOICES,
  PROMPT_EXAMPLES,
} from '../lib/music-options'
import { SONG_OCCASIONS } from '../lib/platform-content'
import { catalogApi } from '../services/api-client'

export type ChoiceOption<T extends string | number = string> = { id: T; label: string }

export type OccasionOption = { code: string; label: string; emoji: string; prompt: string }

export type CreationCatalog = {
  occasions: OccasionOption[]
  genres: ChoiceOption[]
  moods: ChoiceOption[]
  voices: ChoiceOption[]
  languages: ChoiceOption[]
  durations: ChoiceOption<number>[]
  inspirations: string[]
}

const FALLBACK_CATALOG: CreationCatalog = {
  occasions: SONG_OCCASIONS.map((item) => ({ ...item })),
  genres: MUSIC_GENRES.map((item) => ({ ...item })),
  moods: MUSIC_MOODS.map((item) => ({ ...item })),
  voices: MUSIC_VOICES,
  languages: MUSIC_LANGUAGES.map((item) => ({ ...item })),
  durations: MUSIC_DURATIONS.map((item) => ({ ...item })),
  inspirations: [...PROMPT_EXAMPLES],
}

function toChoices(items: CatalogOptionDto[] | undefined, fallback: ChoiceOption[]): ChoiceOption[] {
  return items?.length ? items.map((item) => ({ id: item.code, label: item.label })) : fallback
}

function fromDto(dto: CatalogDto): CreationCatalog {
  return {
    occasions: dto.occasions?.length
      ? dto.occasions.map((item) => ({
          code: item.code,
          label: item.label,
          emoji: item.emoji ?? '🎵',
          prompt: item.defaultPrompt ?? '',
        }))
      : FALLBACK_CATALOG.occasions,
    genres: toChoices(dto.genres, FALLBACK_CATALOG.genres),
    moods: toChoices(dto.moods, FALLBACK_CATALOG.moods),
    voices: toChoices(dto.voices, FALLBACK_CATALOG.voices),
    languages: toChoices(dto.languages, FALLBACK_CATALOG.languages),
    durations: dto.durations?.length
      ? dto.durations.map((item) => ({ id: item.seconds, label: item.label }))
      : FALLBACK_CATALOG.durations,
    inspirations: dto.inspirations?.length
      ? dto.inspirations.map((item) => item.label)
      : FALLBACK_CATALOG.inspirations,
  }
}

/** Choix de création servis par l’API, avec les options locales tant qu’elle n’a pas répondu. */
export function useCatalog(): CreationCatalog {
  const query = useQuery({
    queryKey: ['catalog'],
    queryFn: ({ signal }) => catalogApi.get(signal),
    staleTime: 10 * 60_000,
  })
  return useMemo(() => (query.data ? fromDto(query.data) : FALLBACK_CATALOG), [query.data])
}
