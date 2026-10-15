import './HeroVideo.css'
import './HeroScene.css'

const NOTES = [
  { char: '♪', x: '12%', delay: '0s', duration: '11s' },
  { char: '♫', x: '22%', delay: '1.6s', duration: '13s' },
  { char: '♩', x: '78%', delay: '0.8s', duration: '12s' },
  { char: '♬', x: '88%', delay: '2.4s', duration: '14s' },
  { char: '♪', x: '68%', delay: '3.2s', duration: '10s' },
  { char: '♫', x: '8%', delay: '4s', duration: '15s' },
] as const

const EQ_BARS = 28

type HeroSceneProps = {
  subtitle: string
  title: string
  lead?: string
  primaryHref?: string
  primaryLabel?: string
  secondaryHref?: string
  secondaryLabel?: string
  trustItems?: readonly string[]
}

export function HeroScene({
  subtitle,
  title,
  lead,
  primaryHref = '/creer',
  primaryLabel = 'Créer ma chanson',
  secondaryHref,
  secondaryLabel,
  trustItems,
}: HeroSceneProps) {
  return (
    <div className="site-hero-video site-hero-video--scene">
      <div className="hero-scene" aria-hidden="true">
        <div className="hero-scene__glow" />
        <div className="hero-scene__glow hero-scene__glow--soft" />

        <div className="hero-scene__vinyl-wrap">
          <span className="hero-scene__ring" />
          <span className="hero-scene__ring hero-scene__ring--2" />
          <span className="hero-scene__ring hero-scene__ring--3" />
          <div className="hero-scene__vinyl">
            <span className="hero-scene__grooves" />
            <span className="hero-scene__label" />
          </div>
        </div>

        <ul className="hero-scene__notes">
          {NOTES.map((note) => (
            <li
              key={`${note.char}-${note.x}`}
              style={{
                left: note.x,
                animationDelay: note.delay,
                animationDuration: note.duration,
              }}
            >
              {note.char}
            </li>
          ))}
        </ul>

        <div className="hero-scene__eq">
          {Array.from({ length: EQ_BARS }, (_, index) => (
            <span
              key={index}
              style={{ animationDelay: `${(index % 9) * 0.12}s` }}
            />
          ))}
        </div>
      </div>

      <div className="site-hero-video__overlay site-hero-video__overlay--center">
        <p className="site-hero-video__subtitle">{subtitle}</p>
        <h1 className="site-hero-video__title site-hero-video__title--quote">{title}</h1>
        {lead ? <p className="site-hero-video__lead">{lead}</p> : null}
        <div className="site-hero-video__actions">
          <a className="ui-btn ui-btn--primary" href={primaryHref}>
            {primaryLabel}
          </a>
          {secondaryHref && secondaryLabel ? (
            <a className="ui-btn ui-btn--ghost" href={secondaryHref}>
              {secondaryLabel}
            </a>
          ) : null}
        </div>
        {trustItems && trustItems.length > 0 ? (
          <ul className="site-hero-video__trust">
            {trustItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}
