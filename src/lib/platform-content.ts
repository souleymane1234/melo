import { MUSIC_ROUTES } from './music-routes'

export const SONG_OCCASIONS = [
  {
    emoji: '❤️',
    label: 'Votre partenaire',
    prompt:
      'Une chanson romantique et sincère pour mon partenaire, avec nos souvenirs.',
  },
  {
    emoji: '🤍',
    label: 'Vos parents',
    prompt: 'Une chanson tendre pour remercier mes parents, avec des détails de notre famille.',
  },
  {
    emoji: '🧒',
    label: 'Vos enfants',
    prompt: 'Une chanson douce et joyeuse destinée à mes enfants.',
  },
  {
    emoji: '💍',
    label: 'Un mariage',
    prompt: 'Une chanson émue pour un mariage, qui raconte l’histoire du couple.',
  },
  {
    emoji: '🎂',
    label: 'Un anniversaire',
    prompt: 'Une chanson festive d’anniversaire, personnalisée avec le prénom et des souvenirs.',
  },
  {
    emoji: '🕊️',
    label: 'Un être disparu',
    prompt: 'Une chanson d’hommage douce et respectueuse, pour se souvenir d’un être cher.',
  },
] as const

export function occasionHref(prompt: string): string {
  return `${MUSIC_ROUTES.generate}?prompt=${encodeURIComponent(prompt)}`
}
