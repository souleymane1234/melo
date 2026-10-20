export interface CatalogOptionDto {
  code: string
  label: string
  description?: string | null
}

export interface CatalogOccasionDto {
  code: string
  label: string
  emoji?: string | null
  defaultPrompt?: string | null
}

export interface CatalogDurationDto extends CatalogOptionDto {
  seconds: number
}

/** Réponse GET /api/v1/catalog (champ `data`). */
export interface CatalogDto {
  occasions: CatalogOccasionDto[]
  genres: CatalogOptionDto[]
  moods: CatalogOptionDto[]
  voices: CatalogOptionDto[]
  languages: CatalogOptionDto[]
  durations: CatalogDurationDto[]
  inspirations: CatalogOptionDto[]
}

export interface CatalogEnvelopeDto {
  success: boolean
  message?: string
  data: CatalogDto
}
