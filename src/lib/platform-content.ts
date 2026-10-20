import { MUSIC_ROUTES } from './music-routes'

export const SONG_OCCASIONS = [
  {
    emoji: '❤️',
    code: 'partner',
    label: 'Votre partenaire',
    prompt:
      'Une chanson romantique et sincère pour mon partenaire, avec nos souvenirs.',
  },
  {
    emoji: '🤍',
    code: 'parents',
    label: 'Vos parents',
    prompt: 'Une chanson tendre pour remercier mes parents, avec des détails de notre famille.',
  },
  {
    emoji: '🧒',
    code: 'children',
    label: 'Vos enfants',
    prompt: 'Une chanson douce et joyeuse destinée à mes enfants.',
  },
  {
    emoji: '💍',
    code: 'wedding',
    label: 'Un mariage',
    prompt: 'Une chanson émue pour un mariage, qui raconte l’histoire du couple.',
  },
  {
    emoji: '🎂',
    code: 'birthday',
    label: 'Un anniversaire',
    prompt: 'Une chanson festive d’anniversaire, personnalisée avec le prénom et des souvenirs.',
  },
  {
    emoji: '🕊️',
    code: 'memorial',
    label: 'Un être disparu',
    prompt: 'Une chanson d’hommage douce et respectueuse, pour se souvenir d’un être cher.',
  },
] as const

export function occasionHref(code: string): string {
  return `${MUSIC_ROUTES.generate}?occasion=${encodeURIComponent(code)}`
}
