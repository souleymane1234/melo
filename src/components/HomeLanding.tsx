import { useState, type ReactNode } from 'react'
import { usePublicTracksQuery } from '../hooks/use-music-queries'
import { useRevealOnView } from '../hooks/useRevealOnView'
import { readLocalTracks } from '../lib/music-library'
import { MUSIC_ROUTES } from '../lib/music-routes'
import { SONG_OCCASIONS, occasionHref } from '../lib/platform-content'
import type { MusicTrack } from '../lib/music-types'
import { AudioPlayer } from './AudioPlayer'
import './HomeLanding.css'

const STEPS = [
  {
    n: '1',
    title: 'Racontez votre histoire',
    text: 'Quelques minutes suffisent : qui, quel moment, quels détails vous tiennent à cœur. Pas besoin d’écrire les paroles.',
  },
  {
    n: '2',
    title: 'Nous composons votre chanson',
    text: 'Votre histoire devient un morceau unique : style, voix et paroles pensés pour la personne à qui vous l’offrez.',
  },
  {
    n: '3',
    title: 'Elle la reçoit par SMS ou e-mail',
    text: 'La personne reçoit un lien vers sa chanson, hébergée sur la plateforme : elle l’écoute directement et peut la télécharger.',
  },
] as const

const COMPARISONS = [
  { emoji: '🥀', title: 'Un bouquet', hint: 'Quelques jours', featured: false },
  { emoji: '🍽️', title: 'Un dîner', hint: 'Un beau moment', featured: false },
  { emoji: '❤️', title: 'Votre chanson', hint: 'Pour toujours', featured: true },
] as const

const STORIES = [
  {
    badge: '❤️ Pour ma femme',
    quote:
      'Pour nos seize ans de mariage, j’ai raconté notre rencontre, nos enfants, notre maison. Dès les premières paroles, elle a reconnu notre histoire.',
    author: 'Marc R.',
  },
  {
    badge: '🤍 Pour mon mari',
    quote:
      'Il prenait sa retraite. La chanson parlait de sa carrière, de notre famille, de nos petits-enfants. Il l’a écoutée trois fois de suite.',
    author: 'Anne M.',
  },
  {
    badge: '💍 Un mariage',
    quote:
      'Nous l’avons passée pendant la soirée : elle racontait l’enfance de notre fils, ses rires, notre fierté. Toute la salle était émue.',
    author: 'David et Sara',
  },
  {
    badge: '💐 Pour ma maman',
    quote:
      'Pour ses 80 ans, j’ai parlé de son village, de mon père, de ses quatre enfants. Quand elle a entendu son prénom, elle n’a plus rien dit.',
    author: 'Karim B.',
  },
] as const

const FAQS = [
  {
    q: 'Est-ce sérieux ? Comment saurai-je que ma chanson sera réussie ?',
    a: 'Vous racontez un vrai moment. Le moteur compose à partir de vos détails — prénom, souvenirs, style — pour que la chanson sonne personnelle. Vous pouvez relancer une génération si le premier résultat ne vous convient pas.',
  },
  {
    q: 'Comment ma chanson est-elle créée ?',
    a: 'Vous décrivez l’histoire et choisissez le genre, l’ambiance et la voix. L’intelligence artificielle écrit les paroles (sauf si vous les fournissez) et compose le morceau.',
  },
  {
    q: 'Dois-je écrire les paroles moi-même ?',
    a: 'Non. C’est notre travail. Un court questionnaire suffit. Si vous avez déjà un texte, vous pouvez aussi le coller dans l’atelier.',
  },
  {
    q: 'Comment la personne reçoit-elle la chanson ?',
    a: 'Vous indiquez son prénom et son numéro de téléphone ou son adresse e-mail. Elle reçoit un lien par SMS ou par e-mail qui ouvre une page d’écoute : elle écoute la chanson directement et peut la télécharger.',
  },
  {
    q: 'Où retrouver mes chansons ?',
    a: 'Dans Mon espace : les chansons que vous avez créées et envoyées, celles qu’on vous a offertes, et votre compte.',
  },
  {
    q: 'En combien de temps vais-je recevoir ma chanson ?',
    a: 'Dès que le moteur a terminé la composition. Ce n’est pas une commande artisanale à J+4 : le lecteur n’apparaît que lorsqu’un fichier audio réel est produit.',
  },
  {
    q: 'Est-ce payant ?',
    a: 'Non. La création est gratuite, sans abonnement ni crédits. Aucune offre Premium n’est imposée pour écouter votre chanson.',
  },
  {
    q: 'Ma chanson est-elle privée ?',
    a: 'Elle n’est pas publiée dans un catalogue. Seules les personnes qui ont le lien — vous et le destinataire — peuvent l’écouter.',
  },
] as const

function ExampleReceive() {
  const publicQuery = usePublicTracksQuery()
  const [localTracks] = useState<MusicTrack[]>(readLocalTracks)

  const sample =
    (publicQuery.data ?? []).find((track) => track.audioUrl) ??
    localTracks.find((track) => track.audioUrl) ??
    null

  return (
    <div className="landing-receive__player">
      {sample ? (
        <AudioPlayer track={sample} />
      ) : (
        <div className="landing-receive__placeholder">
          <p className="landing-receive__placeholder-kicker">Votre chanson</p>
          <p className="landing-receive__placeholder-title">« Une mélodie à votre nom »</p>
          <p className="landing-receive__placeholder-meta">Voix intime · Paroles personnalisées</p>
          <p className="landing-receive__placeholder-note">
            L’extrait s’affiche ici dès qu’une vraie création est disponible. Aucun audio n’est simulé.
          </p>
          <a className="ui-btn ui-btn--primary" href={MUSIC_ROUTES.generate}>
            Créer ma chanson
          </a>
        </div>
      )}
    </div>
  )
}

function LandingBlock({
  id,
  className,
  labelledBy,
  children,
}: {
  id?: string
  className: string
  labelledBy?: string
  children: ReactNode
}) {
  const { ref, isVisible } = useRevealOnView<HTMLElement>()
  return (
    <section
      ref={ref}
      id={id}
      className={`${className}${isVisible ? ` ${className}--visible` : ''}`}
      aria-labelledby={labelledBy}
    >
      {children}
    </section>
  )
}

export function HomeLanding() {
  return (
    <div className="landing">
      <LandingBlock id="comment-ca-marche" className="landing-how" labelledBy="landing-how-title">
        <div className="landing__inner">
          <p className="landing__eyebrow">Comment ça marche</p>
          <h2 id="landing-how-title">Trois étapes, une chanson unique</h2>
          <ol className="landing-how__list">
            {STEPS.map((step) => (
              <li key={step.n}>
                <span className="landing-how__n" aria-hidden="true">
                  {step.n}
                </span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
          <a className="ui-btn ui-btn--primary" href={MUSIC_ROUTES.generate}>
            Créer ma chanson
          </a>
        </div>
      </LandingBlock>

      <LandingBlock className="landing-compare" labelledBy="landing-compare-title">
        <div className="landing__inner">
          <h2 id="landing-compare-title">
            Comparez et choisissez
            <span>le cadeau parfait</span>
          </h2>
          <ul className="landing-compare__grid">
            {COMPARISONS.map((item) => (
              <li
                key={item.title}
                className={item.featured ? 'landing-compare__card is-featured' : 'landing-compare__card'}
              >
                {item.featured ? <span className="landing-compare__badge">Meilleur choix</span> : null}
                <span className="landing-compare__emoji" aria-hidden="true">
                  {item.emoji}
                </span>
                <h3>{item.title}</h3>
                <p>{item.hint}</p>
              </li>
            ))}
          </ul>
        </div>
      </LandingBlock>

      <LandingBlock id="avis" className="landing-stories" labelledBy="landing-stories-title">
        <div className="landing__inner">
          <p className="landing__eyebrow">Des histoires, pas un objet</p>
          <h2 id="landing-stories-title">Des centaines de moments transformés en chansons</h2>
          <p className="landing__lead">
            Voici le type d’histoires que vous pouvez raconter : un cadeau que l’on réécoute, pas un souvenir qui se fane.
          </p>
          <ul className="landing-stories__grid">
            {STORIES.map((story) => (
              <li key={story.author}>
                <p className="landing-stories__badge">{story.badge}</p>
                <p className="landing-stories__stars" aria-label="Cinq étoiles">
                  ★★★★★
                </p>
                <blockquote>
                  <p>« {story.quote} »</p>
                  <footer>{story.author}</footer>
                </blockquote>
              </li>
            ))}
          </ul>
        </div>
      </LandingBlock>

      <LandingBlock id="occasions" className="landing-occasions" labelledBy="landing-occasions-title">
        <div className="landing__inner">
          <p className="landing__eyebrow">Offrez une chanson pour…</p>
          <h2 id="landing-occasions-title" className="visually-hidden">
            Occasions
          </h2>
          <ul className="landing-occasions__list">
            {SONG_OCCASIONS.map((item) => (
              <li key={item.label}>
                <a href={occasionHref(item.prompt)}>
                  <span aria-hidden="true">{item.emoji}</span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </LandingBlock>

      <LandingBlock id="exemple" className="landing-receive" labelledBy="landing-receive-title">
        <div className="landing__inner landing-receive__grid">
          <div className="landing-receive__copy">
            <p className="landing__eyebrow">Votre chanson personnalisée</p>
            <h2 id="landing-receive-title">Ce que la personne reçoit</h2>
            <p className="landing__lead">
              Un lien par SMS ou e-mail qui ouvre sa chanson sur la plateforme — comme l’extrait ci-contre, lorsqu’une création réelle existe.
            </p>
            <ul className="landing-receive__perks">
              <li>
                <strong>Écoute directe</strong>
                Aucune application à installer
              </li>
              <li>
                <strong>Téléchargement</strong>
                Pour la garder et la réécouter partout
              </li>
              <li>
                <strong>Votre petit mot</strong>
                Joint à la chanson, avec votre prénom
              </li>
            </ul>
            <a className="ui-btn ui-btn--primary" href={MUSIC_ROUTES.generate}>
              Créer ma chanson
            </a>
          </div>
          <ExampleReceive />
        </div>
      </LandingBlock>

      <LandingBlock id="faq" className="landing-faq" labelledBy="landing-faq-title">
        <div className="landing__inner landing-faq__inner">
          <p className="landing__eyebrow">Des questions ?</p>
          <h2 id="landing-faq-title">Questions fréquentes</h2>
          <p className="landing__lead">Tout ce que vous devez savoir avant de créer.</p>
          <div className="landing-faq__list">
            {FAQS.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </LandingBlock>

      <section className="landing-final" aria-labelledby="landing-final-title">
        <div className="landing__inner">
          <h2 id="landing-final-title">Un cadeau qu’ils écouteront en boucle</h2>
          <p>
            Racontez-nous votre histoire en quelques minutes. Nous en ferons une chanson personnalisée
            qu’ils n’oublieront jamais.
          </p>
          <a className="ui-btn ui-btn--primary" href={MUSIC_ROUTES.generate}>
            Créez votre chanson maintenant
          </a>
        </div>
      </section>
    </div>
  )
}
