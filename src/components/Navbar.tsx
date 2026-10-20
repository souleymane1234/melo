import { useEffect, useState } from 'react'
import { FaUser } from 'react-icons/fa6'
import { getAuthEventName, isCandidateLoggedIn } from '../lib/candidate-auth'
import { isApiLoggedIn } from '../lib/auth-session'
import { MUSIC_ROUTES } from '../lib/music-routes'
import { logout } from '../services/api-client'
import './Navbar.css'

const SCROLL_SOLID_THRESHOLD_PX = 32

const NAV_LINKS = [
  { href: MUSIC_ROUTES.home, label: 'Accueil', match: [] as string[] },
  { href: MUSIC_ROUTES.generate, label: 'Créer une chanson', match: [MUSIC_ROUTES.generate] },
  { href: MUSIC_ROUTES.space, label: 'Mon espace', match: [MUSIC_ROUTES.space, MUSIC_ROUTES.listen] },
]

function isLoggedIn(): boolean {
  return isCandidateLoggedIn() || isApiLoggedIn()
}

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [loggedIn, setLoggedIn] = useState(isLoggedIn)
  const pathname = window.location.pathname
  const isHome = pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_SOLID_THRESHOLD_PX)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onAuthChanged = () => setLoggedIn(isLoggedIn())
    window.addEventListener(getAuthEventName(), onAuthChanged)
    window.addEventListener('storage', onAuthChanged)
    return () => {
      window.removeEventListener(getAuthEventName(), onAuthChanged)
      window.removeEventListener('storage', onAuthChanged)
    }
  }, [])

  const isSolid = !isHome || scrolled || menuOpen

  const isActive = (link: (typeof NAV_LINKS)[number]) =>
    link.match.length === 0
      ? isHome
      : link.match.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))

  const loginActive =
    pathname.startsWith(MUSIC_ROUTES.login) || pathname.startsWith(MUSIC_ROUTES.register)

  return (
    <header className={`site-navbar${isSolid ? ' site-navbar--solid' : ''}`}>
      <a className="site-navbar__brand" href="/" onClick={() => setMenuOpen(false)}>
        <img
          className="site-navbar__logo site-navbar__logo--arms"
          src="/Amoirie.png"
          width={140}
          height={140}
          alt="Armoiries de la République de Côte d'Ivoire"
        />
        <span className="site-navbar__divider" aria-hidden="true" />
        <img
          className="site-navbar__logo site-navbar__logo--skills"
          src="/logo.png"
          width={280}
          height={72}
          alt="Accueil"
        />
      </a>

      <div className="site-navbar__actions">
        <button
          type="button"
          className="site-navbar__toggle"
          aria-expanded={menuOpen}
          aria-controls="site-navbar-menu"
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="site-navbar__toggle-bar" />
          <span className="site-navbar__toggle-bar" />
          <span className="site-navbar__toggle-bar" />
        </button>
      </div>

      <nav
        id="site-navbar-menu"
        className={`site-navbar__nav${menuOpen ? ' site-navbar__nav--open' : ''}`}
        aria-label="Navigation principale"
      >
        <ul className="site-navbar__list">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                className={`site-navbar__link${isActive(link) ? ' site-navbar__link--active' : ''}`}
                href={link.href}
                aria-current={isActive(link) ? 'page' : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            </li>
          ))}
          {loggedIn ? (
            <li>
              <button
                type="button"
                className="site-navbar__link site-navbar__link--logout"
                onClick={() => {
                  setMenuOpen(false)
                  void logout().finally(() => {
                    window.location.href = '/'
                  })
                }}
              >
                Déconnexion
              </button>
            </li>
          ) : (
            <li>
              <a
                className={`site-navbar__icon-btn${loginActive ? ' is-active' : ''}`}
                href={MUSIC_ROUTES.login}
                aria-label="Connexion"
                title="Connexion"
                onClick={() => setMenuOpen(false)}
              >
                <FaUser aria-hidden="true" />
                <span className="site-navbar__icon-btn-label">Connexion</span>
              </a>
            </li>
          )}
        </ul>
      </nav>
    </header>
  )
}
