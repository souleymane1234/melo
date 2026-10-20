export type MusicVoiceType = string
export type MusicLyricsMode = 'ai' | 'custom'
export type MusicTrackStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type DeliveryChannel = 'email' | 'sms'
export type DeliveryStatus = 'sent' | 'pending' | 'failed'

export type SongRecipient = {
  name: string
  channel: DeliveryChannel
  email?: string
  phone?: string
  message?: string
  senderName?: string
}

export type MusicTrack = {
  id: string
  title: string
  prompt: string
  occasion?: string
  genre: string
  mood: string
  voiceType: MusicVoiceType
  language: string
  lyricsMode: MusicLyricsMode
  lyrics?: string
  /** Vide tant que la génération n’est pas terminée. */
  audioUrl: string
  coverUrl?: string
  durationSeconds?: number
  createdAt: string
  status: MusicTrackStatus
  error?: string
  source: 'api' | 'local'
  recipient?: SongRecipient
  deliveryStatus?: DeliveryStatus
  deliveredAt?: string
}

export type MusicJobState = {
  jobId: string
  status: MusicTrackStatus
  error?: string
  track: MusicTrack | null
}

export type GenerateMusicInput = {
  prompt: string
  title?: string
  occasion?: string
  genre: string
  mood: string
  voiceType: MusicVoiceType
  language: string
  lyricsMode: MusicLyricsMode
  lyrics?: string
  durationSeconds: number
  recipient: SongRecipient
}

export class MusicEngineUnavailableError extends Error {
  constructor(message = 'Le moteur de génération musicale n’est pas encore connecté.') {
    super(message)
    this.name = 'MusicEngineUnavailableError'
  }
}
