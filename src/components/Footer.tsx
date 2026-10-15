import './Footer.css'
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaYoutube,
} from 'react-icons/fa6'

const CURRENT_YEAR = new Date().getFullYear()

const SOCIAL_LINKS = [
  {
    href: 'https://www.facebook.com/profile.php?id=61593259599194',
    label: 'Facebook',
    icon: FaFacebookF,
  },
  {
    href: 'https://www.instagram.com/worldskills_ci',
    label: 'Instagram',
    icon: FaInstagram,
  },
  {
    href: 'https://www.linkedin.com/in/worldskills-cote-d-ivoire-account-97237542b/',
    label: 'LinkedIn',
    icon: FaLinkedinIn,
  },
  {
    href: 'https://www.tiktok.com/@worldskills.cte.d',
    label: 'TikTok',
    icon: FaTiktok,
  },
  {
    href: 'https://www.youtube.com/@WorldskillsCôtedIvoire',
    label: 'YouTube',
    icon: FaYoutube,
  },
] as const

const FOOTER_COLUMNS = [
  {
    title: 'Plateforme',
    links: [
      { href: '/', label: 'Accueil' },
      { href: '/creer', label: 'Créer une chanson' },
      { href: '/mon-espace', label: 'Mon espace' },
    ],
  },
  {
    title: 'Mon espace',
    links: [
      { href: '/mon-espace#chansons', label: 'Mes chansons' },
      { href: '/mon-espace#recues', label: 'Chansons reçues' },
      { href: '/mon-espace#compte', label: 'Mon compte' },
    ],
  },
  {
    title: 'Aide',
    links: [
      { href: '/#comment-ca-marche', label: 'Comment ça marche' },
      { href: '/#faq', label: 'FAQ' },
      { href: '/connexion', label: 'Connexion' },
    ],
  },
] as const

export function Footer() {
  return (
    <footer className="site-footer" aria-label="Pied de page">
      <div className="site-footer__main">
        <section className="site-footer__brand" aria-label="Plateforme musicale">
          <a className="site-footer__brand-logo" href="/#accueil" aria-label="Accueil">
            <img
              className="site-footer__logo site-footer__logo--ortt"
              src="/lta.png"
              alt="Révèle Ton Talent"
              width={160}
              height={56}
            />
            <img
              className="site-footer__logo site-footer__logo--lta"
              src="/ortt.png"
              alt="LTA"
              width={160}
              height={56}
            />
          </a>
          <p className="site-footer__tagline">
            Des chansons personnalisées pour les moments les plus précieux de la vie.
          </p>
          <ul className="site-footer__socials" aria-label="Réseaux sociaux">
            {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noreferrer" aria-label={label}>
                  <Icon aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <div className="site-footer__columns">
          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.title} className="site-footer__column" aria-label={column.title}>
              <h3>{column.title}</h3>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="site-footer__bottom">
        <div className="site-footer__legal">
          <a href="/mentions">Mentions légales</a>
          <a href="/confidentialite">Politique de confidentialité</a>
        </div>
        <p className="site-footer__copy">
          {CURRENT_YEAR} Plateforme de génération musicale. Tous droits réservés.
        </p>
      </div>
    </footer>
  )
}
