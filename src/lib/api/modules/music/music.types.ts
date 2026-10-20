import type {
  DeliveryStatus,
  GenerateMusicInput,
  MusicLyricsMode,
  MusicTrack,
  MusicTrackStatus,
  SongRecipient,
} from '../../../music-types'

export type GenerateMusicBodyDto = GenerateMusicInput

export interface MusicTrackDto {
  id?: string
  title?: string | null
  jobId?: string | null
  prompt?: string | null
  occasion?: string | null
  error?: string | null
  description?: string | null
  genre?: string | null
  mood?: string | null
  voiceType?: string | null
  voice_type?: string | null
  language?: string | null
  lyricsMode?: string | null
  lyrics_mode?: string | null
  lyrics?: string | null
  audioUrl?: string | null
  audio_url?: string | null
  url?: string | null
  coverUrl?: string | null
  cover_url?: string | null
  imageUrl?: string | null
  durationSeconds?: number | null
  duration?: number | null
  createdAt?: string | null
  created_at?: string | null
  status?: string | null
  recipient?: Partial<SongRecipient> | null
  deliveryStatus?: string | null
  delivery_status?: string | null
  deliveredAt?: string | null
}

export interface MusicJobDto {
  id?: string
  jobId?: string
  status?: string | null
  track?: MusicTrackDto | null
  data?: MusicTrackDto | MusicJobDto | null
  audioUrl?: string | null
  audio_url?: string | null
  error?: string | null
  message?: string | null
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function normalizeLyricsMode(value: string | undefined): MusicLyricsMode {
  return value === 'custom' ? 'custom' : 'ai'
}

export function normalizeStatus(value: string | undefined): MusicTrackStatus {
  if (value === 'pending' || value === 'processing' || value === 'completed' || value === 'failed') {
    return value
  }
  if (value === 'success' || value === 'ready' || value === 'done') return 'completed'
  if (value === 'error') return 'failed'
  if (value === 'queued' || value === 'running') return 'processing'
  return 'processing'
}

function normalizeDelivery(value: string | undefined): DeliveryStatus | undefined {
  if (!value) return undefined
  const key = value.toLowerCase()
  if (key === 'sent' || key === 'delivered' || key === 'success') return 'sent'
  if (key === 'failed' || key === 'error') return 'failed'
  if (key === 'pending' || key === 'queued' || key === 'processing') return 'pending'
  return undefined
}

function normalizeRecipient(value: Partial<SongRecipient> | null | undefined): SongRecipient | undefined {
  const name = asString(value?.name)
  if (!value || !name) return undefined
  return {
    name,
    channel: value.channel === 'sms' ? 'sms' : 'email',
    email: asString(value.email),
    phone: asString(value.phone),
    message: asString(value.message),
    senderName: asString(value.senderName),
  }
}

export function unwrapTrackPayload(payload: unknown): MusicTrackDto | null {
  const record = asRecord(payload)
  if (!record) return null
  if (asRecord(record.track)) return record.track as MusicTrackDto
  const data = asRecord(record.data)
  if (data?.audioUrl || data?.audio_url || data?.id) return data as MusicTrackDto
  if (record.audioUrl || record.audio_url || record.id) return record as MusicTrackDto
  return null
}

export function unwrapJobPayload(payload: unknown): MusicJobDto {
  const record = asRecord(payload) ?? {}
  const data = asRecord(record.data)
  return {
    ...(record as MusicJobDto),
    ...(data as MusicJobDto),
    track: (asRecord(record.track) ?? asRecord(data?.track) ?? data) as MusicTrackDto | null,
  }
}

export function unwrapTrackList(payload: unknown): MusicTrackDto[] {
  if (Array.isArray(payload)) return payload as MusicTrackDto[]
  const record = asRecord(payload)
  if (!record) return []
  if (Array.isArray(record.items)) return record.items as MusicTrackDto[]
  if (Array.isArray(record.tracks)) return record.tracks as MusicTrackDto[]
  const data = record.data
  if (Array.isArray(data)) return data as MusicTrackDto[]
  const nested = asRecord(data)
  if (Array.isArray(nested?.items)) return nested.items as MusicTrackDto[]
  return []
}

export function mapTrackDto(
  dto: MusicTrackDto,
  fallback?: Partial<MusicTrack>,
): MusicTrack | null {
  const audioUrl =
    asString(dto.audioUrl) ?? asString(dto.audio_url) ?? asString(dto.url) ?? fallback?.audioUrl ?? ''
  const id = asString(dto.id) ?? fallback?.id
  if (!id) return null

  return {
    id,
    title: asString(dto.title) ?? fallback?.title ?? 'Sans titre',
    prompt: asString(dto.prompt) ?? asString(dto.description) ?? fallback?.prompt ?? '',
    occasion: asString(dto.occasion) ?? fallback?.occasion,
    genre: asString(dto.genre) ?? fallback?.genre ?? 'pop',
    mood: asString(dto.mood) ?? fallback?.mood ?? 'joyeuse',
    voiceType: asString(dto.voiceType) ?? asString(dto.voice_type) ?? fallback?.voiceType ?? 'female',
    language: asString(dto.language) ?? fallback?.language ?? 'fr',
    lyricsMode: normalizeLyricsMode(
      asString(dto.lyricsMode) ?? asString(dto.lyrics_mode) ?? fallback?.lyricsMode,
    ),
    lyrics: asString(dto.lyrics) ?? fallback?.lyrics,
    audioUrl,
    coverUrl: asString(dto.coverUrl) ?? asString(dto.cover_url) ?? asString(dto.imageUrl),
    durationSeconds: asNumber(dto.durationSeconds) ?? asNumber(dto.duration) ?? fallback?.durationSeconds,
    createdAt: asString(dto.createdAt) ?? asString(dto.created_at) ?? fallback?.createdAt ?? new Date().toISOString(),
    status: normalizeStatus(asString(dto.status) ?? fallback?.status ?? (audioUrl ? 'completed' : 'pending')),
    error: asString(dto.error),
    source: 'api',
    recipient: normalizeRecipient(dto.recipient) ?? fallback?.recipient,
    deliveryStatus:
      normalizeDelivery(asString(dto.deliveryStatus) ?? asString(dto.delivery_status)) ??
      fallback?.deliveryStatus,
    deliveredAt: asString(dto.deliveredAt) ?? fallback?.deliveredAt,
  }
}
