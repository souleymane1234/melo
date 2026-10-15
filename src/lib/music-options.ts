import type { MusicLyricsMode, MusicVoiceType } from './music-types'

export const MUSIC_GENRES = [
  { id: 'afrobeat', label: 'Afrobeat' },
  { id: 'coupe-decale', label: 'Coupé-décalé' },
  { id: 'zouglou', label: 'Zouglou' },
  { id: 'gospel', label: 'Gospel' },
  { id: 'rap', label: 'Rap' },
  { id: 'rnb', label: 'R&B' },
  { id: 'pop', label: 'Pop' },
  { id: 'jazz', label: 'Jazz' },
  { id: 'reggae', label: 'Reggae' },
  { id: 'classique', label: 'Musique classique' },
  { id: 'highlife', label: 'Highlife' },
  { id: 'soul', label: 'Soul' },
] as const

export const MUSIC_MOODS = [
  { id: 'joyeuse', label: 'Joyeuse' },
  { id: 'romantique', label: 'Romantique' },
  { id: 'triste', label: 'Triste' },
  { id: 'energique', label: 'Énergique' },
  { id: 'relaxante', label: 'Relaxante' },
  { id: 'epique', label: 'Épique' },
  { id: 'nostalgique', label: 'Nostalgique' },
] as const

export const MUSIC_VOICES: { id: MusicVoiceType; label: string }[] = [
  { id: 'female', label: 'Voix féminine' },
  { id: 'male', label: 'Voix masculine' },
  { id: 'duo', label: 'Duo' },
  { id: 'instrumental', label: 'Instrumental' },
]

export const MUSIC_LANGUAGES = [
  { id: 'fr', label: 'Français' },
  { id: 'en', label: 'Anglais' },
  { id: 'nouchi', label: 'Nouchi' },
  { id: 'es', label: 'Espagnol' },
] as const

export const MUSIC_DURATIONS = [
  { id: 30, label: '30 s' },
  { id: 60, label: '1 min' },
  { id: 120, label: '2 min' },
] as const

export const MUSIC_LYRICS_MODES: { id: MusicLyricsMode; label: string; hint: string }[] = [
  { id: 'ai', label: 'Paroles générées', hint: 'L’IA écrit les paroles à partir de votre idée.' },
  { id: 'custom', label: 'Mes paroles', hint: 'Vous fournissez le texte à chanter.' },
]

export const PROMPT_EXAMPLES = [
  'Une chanson romantique pour déclarer mon amour à ma femme.',
  'Un morceau de coupé-décalé énergique pour faire danser tout le monde.',
  'Une chanson gospel inspirante avec une chorale puissante.',
  'Une chanson afrobeat pour souhaiter un joyeux anniversaire à mon frère.',
  'Une musique douce et mélancolique au piano.',
] as const

export function genreLabel(id: string): string {
  return MUSIC_GENRES.find((item) => item.id === id)?.label ?? id
}

export function moodLabel(id: string): string {
  return MUSIC_MOODS.find((item) => item.id === id)?.label ?? id
}

export function voiceLabel(id: string): string {
  return MUSIC_VOICES.find((item) => item.id === id)?.label ?? id
}

export function languageLabel(id: string): string {
  return MUSIC_LANGUAGES.find((item) => item.id === id)?.label ?? id
}
