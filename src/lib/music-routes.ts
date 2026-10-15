export const MUSIC_ROUTES = {
  home: '/',
  generate: '/creer',
  space: '/mon-espace',
  listen: '/ecouter',
  login: '/connexion',
  register: '/inscription',
} as const

export function songPath(id: string): string {
  return `${MUSIC_ROUTES.listen}/${encodeURIComponent(id)}`
}

export function songShareUrl(id: string): string {
  return `${window.location.origin}${songPath(id)}`
}
