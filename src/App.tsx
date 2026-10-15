import { useEffect, type ReactNode } from 'react'
import { Navbar } from './components/Navbar'
import { ConnexionPage } from './components/ConnexionPage'
import { Footer } from './components/Footer'
import { GeneratePage } from './components/GeneratePage'
import { HomePage } from './components/HomePage'
import { LegalPage } from './components/LegalPage'
import { MonEspacePage } from './components/MonEspacePage'
import { SongDetailPage } from './components/SongDetailPage'
import { MUSIC_ROUTES } from './lib/music-routes'
import './App.css'

function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <div className="ticks" />
      <Footer />
    </>
  )
}

function matches(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

function idFromPath(pathname: string, prefixes: string[]): string | null {
  for (const prefix of prefixes) {
    const match = pathname.match(new RegExp(`^${prefix}/([^/]+)/?$`))
    if (match) return decodeURIComponent(match[1])
  }
  return null
}

const LEGACY_REDIRECTS: { prefixes: string[]; to: string }[] = [
  { prefixes: ['/competition', '/concours'], to: MUSIC_ROUTES.generate },
  { prefixes: ['/play', '/mes-creations'], to: `${MUSIC_ROUTES.space}#chansons` },
  { prefixes: ['/profil'], to: `${MUSIC_ROUTES.space}#compte` },
  {
    prefixes: [
      '/actualites',
      '/creations',
      '/alertes',
      '/reels',
      '/partenariat',
      '/contact',
      '/recherche',
      '/showroom',
      '/vote',
      '/candidature',
      '/inscription-candidat',
      '/inscription-expert',
      '/metiers',
    ],
    to: MUSIC_ROUTES.home,
  },
]

function App() {
  const pathname = window.location.pathname

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    const hash = window.location.hash
    if (hash && hash !== '#' && hash !== '#accueil') return
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  if (matches(pathname, MUSIC_ROUTES.generate)) {
    return (
      <PageShell>
        <GeneratePage />
      </PageShell>
    )
  }

  if (matches(pathname, MUSIC_ROUTES.space)) {
    return (
      <PageShell>
        <MonEspacePage />
      </PageShell>
    )
  }

  const songId = idFromPath(pathname, [MUSIC_ROUTES.listen, '/actualites', '/creations'])
  if (songId) {
    if (!matches(pathname, MUSIC_ROUTES.listen)) {
      window.location.replace(`${MUSIC_ROUTES.listen}/${encodeURIComponent(songId)}`)
      return null
    }
    return (
      <PageShell>
        <SongDetailPage id={songId} />
      </PageShell>
    )
  }

  if (matches(pathname, MUSIC_ROUTES.login) || matches(pathname, MUSIC_ROUTES.register)) {
    return <ConnexionPage />
  }

  if (matches(pathname, '/mentions') || matches(pathname, '/confidentialite')) {
    return (
      <PageShell>
        <LegalPage variant={matches(pathname, '/mentions') ? 'mentions' : 'confidentialite'} />
      </PageShell>
    )
  }

  const legacy = LEGACY_REDIRECTS.find((rule) => rule.prefixes.some((p) => matches(pathname, p)))
  if (legacy) {
    window.location.replace(legacy.to)
    return null
  }

  return (
    <PageShell>
      <HomePage />
    </PageShell>
  )
}

export default App
