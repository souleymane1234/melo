import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { FaArrowLeft, FaArrowRight, FaArrowRotateRight, FaCheck, FaDownload } from 'react-icons/fa6'
import { MUSIC_DELIVERY_DELAY_HOURS, MUSIC_GENERATION_LIVE } from '../config/app-config'
import { useCatalog, type ChoiceOption } from '../hooks/use-catalog'
import { musicErrorMessage, useGenerateMusicMutation } from '../hooks/use-music-queries'
import { ApiHttpError } from '../lib/api'
import { isApiLoggedIn } from '../lib/auth-session'
import { MUSIC_LYRICS_MODES } from '../lib/music-options'
import { MUSIC_ROUTES, songPath } from '../lib/music-routes'
import type { DeliveryChannel, MusicLyricsMode } from '../lib/music-types'
import { toE164 } from '../lib/phone'
import { SONG_OCCASIONS } from '../lib/platform-content'
import { channelLabel, isValidEmail, isValidPhone } from '../lib/song-delivery'
import { AudioPlayer } from './AudioPlayer'
import { RequestSentModal } from './RequestSentModal'
import { SongDelivery } from './SongDelivery'
import './GeneratePage.css'

const STEPS = [
  { id: 'destinataire', label: 'Destinataire' },
  { id: 'histoire', label: 'Histoire' },
  { id: 'style', label: 'Style' },
  { id: 'paroles', label: 'Paroles' },
  { id: 'envoi', label: 'Envoi' },
  { id: 'recap', label: 'Récapitulatif' },
] as const

const LAST_STEP = STEPS.length - 1

const CHANNELS: { id: DeliveryChannel; label: string; hint: string }[] = [
  { id: 'sms', label: 'SMS', hint: 'Le lien arrive sur son téléphone' },
  { id: 'email', label: 'E-mail', hint: 'Le lien arrive dans sa boîte mail' },
]

const DRAFT_KEY = 'melo-create-draft'

type Draft = {
  occasion: string
  prompt: string
  title: string
  genre: string
  mood: string
  voiceType: string
  language: string
  lyricsMode: MusicLyricsMode
  lyrics: string
  durationSeconds: number
  recipientName: string
  senderName: string
  channel: DeliveryChannel
  recipientEmail: string
  recipientPhone: string
  recipientMessage: string
  step: number
  furthest: number
}

function readDraft(): Partial<Draft> {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY)
    return raw ? (JSON.parse(raw) as Partial<Draft>) : {}
  } catch {
    return {}
  }
}

function labelOf<T extends string | number>(options: ChoiceOption<T>[], id: T): string {
  return options.find((item) => item.id === id)?.label ?? String(id)
}

type ChoiceGroupProps<T extends string | number> = {
  legend: string
  name: string
  options: readonly { id: T; label: string }[]
  value: T
  onChange: (value: T) => void
  hint?: string
}

function ChoiceGroup<T extends string | number>({
  legend,
  name,
  options,
  value,
  onChange,
  hint,
}: ChoiceGroupProps<T>) {
  return (
    <fieldset className="wizard__fieldset">
      <legend>{legend}</legend>
      <div className="generate-page__choices">
        {options.map((item) => (
          <label key={String(item.id)} className={value === item.id ? 'is-active' : ''}>
            <input
              type="radio"
              name={name}
              value={String(item.id)}
              checked={value === item.id}
              onChange={() => onChange(item.id)}
            />
            {item.label}
          </label>
        ))}
      </div>
      {hint ? <p className="generate-page__hint">{hint}</p> : null}
    </fieldset>
  )
}

export function GeneratePage() {
  const params = useMemo(() => new URLSearchParams(window.location.search), [])
  const [draft] = useState(readDraft)
  const catalog = useCatalog()
  const urlOccasion = params.get('occasion')
  const [occasion, setOccasion] = useState(urlOccasion ?? draft.occasion ?? '')
  const [prompt, setPrompt] = useState(
    params.get('prompt') ??
      (urlOccasion ? SONG_OCCASIONS.find((item) => item.code === urlOccasion)?.prompt : undefined) ??
      draft.prompt ??
      '',
  )
  const [title, setTitle] = useState(draft.title ?? '')
  const [genre, setGenre] = useState(params.get('genre') ?? draft.genre ?? 'afrobeat')
  const [mood, setMood] = useState(params.get('mood') ?? draft.mood ?? 'joyeuse')
  const [voiceType, setVoiceType] = useState(draft.voiceType ?? 'female')
  const [language, setLanguage] = useState(draft.language ?? 'fr')
  const [lyricsMode, setLyricsMode] = useState<MusicLyricsMode>(draft.lyricsMode ?? 'ai')
  const [lyrics, setLyrics] = useState(draft.lyrics ?? '')
  const [durationSeconds, setDurationSeconds] = useState(draft.durationSeconds ?? 60)
  const [recipientName, setRecipientName] = useState(draft.recipientName ?? '')
  const [senderName, setSenderName] = useState(draft.senderName ?? '')
  const [channel, setChannel] = useState<DeliveryChannel>(draft.channel ?? 'sms')
  const [recipientEmail, setRecipientEmail] = useState(draft.recipientEmail ?? '')
  const [recipientPhone, setRecipientPhone] = useState(draft.recipientPhone ?? '')
  const [recipientMessage, setRecipientMessage] = useState(draft.recipientMessage ?? '')
  const [step, setStep] = useState(draft.step ?? 0)
  const [furthest, setFurthest] = useState(draft.furthest ?? 0)
  const [showErrors, setShowErrors] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const firstRender = useRef(true)
  const loggedIn = isApiLoggedIn()

  const generation = useGenerateMusicMutation()
  const result = generation.data ?? null
  const track = result?.status === 'completed' && result.audioUrl ? result : null

  useEffect(() => {
    const value: Draft = {
      occasion,
      prompt,
      title,
      genre,
      mood,
      voiceType,
      language,
      lyricsMode,
      lyrics,
      durationSeconds,
      recipientName,
      senderName,
      channel,
      recipientEmail,
      recipientPhone,
      recipientMessage,
      step,
      furthest,
    }
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(value))
  }, [
    occasion,
    prompt,
    title,
    genre,
    mood,
    voiceType,
    language,
    lyricsMode,
    lyrics,
    durationSeconds,
    recipientName,
    senderName,
    channel,
    recipientEmail,
    recipientPhone,
    recipientMessage,
    step,
    furthest,
  ])

  const contact = channel === 'email' ? recipientEmail.trim() : recipientPhone.trim()
  const stepValid = [
    recipientName.trim().length >= 2,
    prompt.trim().length >= 8,
    true,
    lyricsMode === 'ai' || lyrics.trim().length >= 8,
    channel === 'email' ? isValidEmail(recipientEmail) : isValidPhone(recipientPhone),
    true,
  ]
  const allValid = stepValid.every(Boolean)
  const isDone = (index: number) => index < furthest && stepValid[index]
  const canOpen = (index: number) => index <= furthest || stepValid.slice(0, index).every(Boolean)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    headingRef.current?.focus()
  }, [step])

  const goTo = (index: number) => {
    if (!canOpen(index)) return
    setShowErrors(false)
    setStep(index)
    setFurthest((value) => Math.max(value, index))
  }

  const next = () => {
    if (!stepValid[step]) {
      setShowErrors(true)
      return
    }
    goTo(Math.min(step + 1, LAST_STEP))
  }

  const generate = () => {
    if (!allValid || !loggedIn || generation.isPending) return
    generation.reset()
    generation.mutate(
      {
      recipient: {
        name: recipientName.trim(),
        channel,
        email: channel === 'email' ? recipientEmail.trim() : undefined,
        phone: channel === 'sms' ? (toE164(recipientPhone) ?? recipientPhone.trim()) : undefined,
        message: recipientMessage.trim() || undefined,
        senderName: senderName.trim() || undefined,
      },
      prompt: prompt.trim(),
      title: title.trim() || undefined,
      occasion: occasion || undefined,
      genre,
      mood,
      voiceType,
      language,
      lyricsMode,
      lyrics: lyricsMode === 'custom' ? lyrics.trim() : undefined,
      durationSeconds,
      },
      { onSuccess: () => window.sessionStorage.removeItem(DRAFT_KEY) },
    )
  }

  const pickOccasion = (code: string, defaultPrompt: string) => {
    const next = occasion === code ? '' : code
    setOccasion(next)
    const isDefaultPrompt =
      !prompt.trim() || catalog.occasions.some((item) => item.prompt && item.prompt === prompt)
    if (next && defaultPrompt && isDefaultPrompt) setPrompt(defaultPrompt)
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (step < LAST_STEP) next()
    else generate()
  }

  const restart = () => {
    generation.reset()
    setStep(0)
    setFurthest(0)
  }

  const resetGeneration = generation.reset
  const startNewSong = useCallback(() => {
    resetGeneration()
    setOccasion('')
    setPrompt('')
    setTitle('')
    setLyrics('')
    setLyricsMode('ai')
    setRecipientName('')
    setRecipientEmail('')
    setRecipientPhone('')
    setRecipientMessage('')
    setShowErrors(false)
    setStep(0)
    setFurthest(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [resetGeneration])

  const requestSent = !MUSIC_GENERATION_LIVE && result && !track ? result : null

  const who = recipientName.trim() || 'cette personne'
  const loginHref = `${MUSIC_ROUTES.login}?next=${encodeURIComponent(MUSIC_ROUTES.generate)}`
  const progress = Math.round((STEPS.filter((_, index) => isDone(index)).length / LAST_STEP) * 100)

  if (MUSIC_GENERATION_LIVE && result && !track) {
    return (
      <main id="creer" className="page-main generate-page">
        <div className="ui-container generate-page__layout">
          <section className="generate-page__result ui-card">
            <p className="ui-eyebrow">Création en cours</p>
            <h1>Votre chanson pour {result.recipient?.name ?? who} se prépare</h1>
            <p className="generate-page__note">
              La composition prend un peu plus de temps que prévu. Elle continue sur nos serveurs : dès
              qu’elle sera prête, le lien sera envoyé automatiquement à {result.recipient?.name ?? who}{' '}
              par {channelLabel(result.recipient?.channel ?? channel)}. Vous pouvez suivre son avancement
              dans Mon espace.
            </p>
            <div className="generate-page__result-actions">
              <a className="ui-btn ui-btn--primary" href={`${MUSIC_ROUTES.space}#chansons`}>
                Suivre dans Mon espace
              </a>
              <button type="button" className="ui-btn ui-btn--ghost" onClick={restart}>
                <FaArrowRotateRight aria-hidden="true" />
                Nouvelle chanson
              </button>
            </div>
          </section>
        </div>
      </main>
    )
  }

  if (track) {
    return (
      <main id="creer" className="page-main generate-page">
        <div className="ui-container generate-page__layout">
          <section className="generate-page__result ui-card">
            <p className="ui-eyebrow">C’est prêt</p>
            <h1>Votre chanson pour {track.recipient?.name ?? who}</h1>
            <AudioPlayer track={track} />
            {track.lyrics ? (
              <div className="generate-page__lyrics">
                <h3>Paroles</h3>
                <pre>{track.lyrics}</pre>
              </div>
            ) : null}
            <SongDelivery track={track} />
            <div className="generate-page__result-actions">
              <a className="ui-btn ui-btn--ghost" href={track.audioUrl} download>
                <FaDownload aria-hidden="true" />
                Télécharger
              </a>
              <a className="ui-btn ui-btn--ghost" href={songPath(track.id)}>
                Voir la page d’écoute
              </a>
              <a className="ui-btn ui-btn--ghost" href={MUSIC_ROUTES.space}>
                Mon espace
              </a>
              <button type="button" className="ui-btn ui-btn--ghost" onClick={restart}>
                <FaArrowRotateRight aria-hidden="true" />
                Nouvelle chanson
              </button>
            </div>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main id="creer" className="page-main generate-page">
      <div className="ui-container generate-page__layout wizard">
        <header className="generate-page__header">
          <p className="ui-eyebrow">Créer une chanson</p>
          <h1>Offrez une chanson en quelques étapes</h1>
        </header>

        <nav className="wizard__stepper" aria-label="Étapes de création">
          <div className="wizard__progress" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
          <ol>
            {STEPS.map((item, index) => {
              const done = isDone(index)
              const current = index === step
              const state = current ? 'is-current' : done ? 'is-done' : canOpen(index) ? 'is-open' : 'is-locked'
              return (
                <li key={item.id} className={`wizard__step ${state}`}>
                  <button
                    type="button"
                    onClick={() => goTo(index)}
                    disabled={!canOpen(index)}
                    aria-current={current ? 'step' : undefined}
                    aria-label={`Étape ${index + 1} : ${item.label}${done ? ' (validée)' : ''}`}
                  >
                    <span className="wizard__dot" aria-hidden="true">
                      {done && !current ? <FaCheck /> : index + 1}
                    </span>
                    <span className="wizard__step-label">{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ol>
        </nav>

        <form className="wizard__card ui-card" onSubmit={onSubmit} noValidate>
          <div className="wizard__top">
            {step > 0 ? (
              <button
                type="button"
                className="wizard__back"
                onClick={() => goTo(step - 1)}
                disabled={generation.isPending}
              >
                <FaArrowLeft aria-hidden="true" />
                {STEPS[step - 1].label}
              </button>
            ) : null}
            <p className="wizard__count">
              Étape {step + 1} sur {STEPS.length}
            </p>
          </div>

          {step === 0 ? (
            <div className="wizard__body">
              <h2 ref={headingRef} tabIndex={-1}>
                À qui offrez-vous cette chanson ?
              </h2>
              <label className="wizard__field">
                Son prénom
                <input
                  value={recipientName}
                  onChange={(event) => setRecipientName(event.target.value)}
                  placeholder="Ex. Aïcha"
                  autoComplete="off"
                  autoFocus
                />
              </label>
              {showErrors && !stepValid[0] ? (
                <p className="wizard__error">Indiquez au moins 2 lettres.</p>
              ) : null}
              <label className="wizard__field">
                Votre prénom <span>(optionnel, affiché comme expéditeur)</span>
                <input
                  value={senderName}
                  onChange={(event) => setSenderName(event.target.value)}
                  placeholder="Ex. Karim"
                  autoComplete="given-name"
                />
              </label>
              <p className="wizard__sublabel">C’est pour quelle occasion ?</p>
              <div className="generate-page__examples">
                {catalog.occasions.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    className={`generate-page__chip${occasion === item.code ? ' is-active' : ''}`}
                    aria-pressed={occasion === item.code}
                    onClick={() => pickOccasion(item.code, item.prompt)}
                  >
                    <span aria-hidden="true">{item.emoji}</span> {item.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="wizard__body">
              <h2 ref={headingRef} tabIndex={-1}>
                Racontez votre histoire avec {who}
              </h2>
              <p className="wizard__lead">
                Souvenirs, lieux, surnoms, un détail que seul(e) {who} reconnaîtra : plus c’est précis,
                plus la chanson sera personnelle.
              </p>
              <textarea
                rows={7}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Ex. Pour nos 10 ans de mariage, je veux une chanson qui raconte notre rencontre à Abidjan, nos enfants et notre maison…"
                aria-label="Votre histoire"
              />
              {showErrors && !stepValid[1] ? (
                <p className="wizard__error">Écrivez au moins quelques mots (8 caractères).</p>
              ) : null}
              <p className="generate-page__hint">Besoin d’inspiration ?</p>
              <div className="generate-page__examples">
                {catalog.inspirations.map((example) => (
                  <button
                    key={example}
                    type="button"
                    className="generate-page__chip"
                    onClick={() => setPrompt(example)}
                  >
                    {example}
                  </button>
                ))}
              </div>
              <label className="wizard__field">
                Titre <span>(optionnel)</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ex. Lumière d’Abidjan"
                />
              </label>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="wizard__body">
              <h2 ref={headingRef} tabIndex={-1}>
                Quel style lui ressemble ?
              </h2>
              <ChoiceGroup legend="Genre musical" name="genre" options={catalog.genres} value={genre} onChange={setGenre} />
              <ChoiceGroup legend="Ambiance" name="mood" options={catalog.moods} value={mood} onChange={setMood} />
              <ChoiceGroup legend="Voix" name="voiceType" options={catalog.voices} value={voiceType} onChange={setVoiceType} />
              <ChoiceGroup legend="Langue" name="language" options={catalog.languages} value={language} onChange={setLanguage} />
            </div>
          ) : null}

          {step === 3 ? (
            <div className="wizard__body">
              <h2 ref={headingRef} tabIndex={-1}>
                Les paroles et la durée
              </h2>
              <ChoiceGroup
                legend="Paroles"
                name="lyricsMode"
                options={MUSIC_LYRICS_MODES}
                value={lyricsMode}
                onChange={setLyricsMode}
                hint={MUSIC_LYRICS_MODES.find((item) => item.id === lyricsMode)?.hint}
              />
              {lyricsMode === 'custom' ? (
                <>
                  <textarea
                    rows={6}
                    value={lyrics}
                    onChange={(event) => setLyrics(event.target.value)}
                    placeholder="Collez ici le texte à chanter."
                    aria-label="Paroles personnalisées"
                  />
                  {showErrors && !stepValid[3] ? (
                    <p className="wizard__error">Collez vos paroles (8 caractères minimum).</p>
                  ) : null}
                </>
              ) : null}
              <ChoiceGroup
                legend="Durée souhaitée"
                name="duration"
                options={catalog.durations}
                value={durationSeconds}
                onChange={setDurationSeconds}
                hint="Prise en compte uniquement si le moteur le permet."
              />
            </div>
          ) : null}

          {step === 4 ? (
            <div className="wizard__body">
              <h2 ref={headingRef} tabIndex={-1}>
                Comment {who} reçoit-il / elle la chanson ?
              </h2>
              <div className="wizard__channels" role="radiogroup" aria-label="Canal d’envoi">
                {CHANNELS.map((item) => (
                  <label key={item.id} className={`wizard__channel${channel === item.id ? ' is-active' : ''}`}>
                    <input
                      type="radio"
                      name="channel"
                      value={item.id}
                      checked={channel === item.id}
                      onChange={() => setChannel(item.id)}
                    />
                    <strong>{item.label}</strong>
                    <span>{item.hint}</span>
                  </label>
                ))}
              </div>
              {channel === 'sms' ? (
                <label className="wizard__field">
                  Numéro de téléphone
                  <input
                    type="tel"
                    value={recipientPhone}
                    onChange={(event) => setRecipientPhone(event.target.value)}
                    placeholder="Ex. +225 07 00 00 00 00"
                    autoComplete="off"
                  />
                </label>
              ) : (
                <label className="wizard__field">
                  Adresse e-mail
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(event) => setRecipientEmail(event.target.value)}
                    placeholder="Ex. aicha@exemple.com"
                    autoComplete="off"
                  />
                </label>
              )}
              {showErrors && !stepValid[4] ? (
                <p className="wizard__error">
                  {channel === 'sms' ? 'Numéro invalide (8 chiffres minimum).' : 'Adresse e-mail invalide.'}
                </p>
              ) : null}
              <label className="wizard__field">
                Petit mot <span>(optionnel, joint au lien)</span>
                <input
                  maxLength={240}
                  value={recipientMessage}
                  onChange={(event) => setRecipientMessage(event.target.value)}
                  placeholder="Ex. Joyeux anniversaire, ma sœur adorée !"
                />
              </label>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="wizard__body">
              <h2 ref={headingRef} tabIndex={-1}>
                Tout est prêt ?
              </h2>
              {!MUSIC_GENERATION_LIVE ? (
                <p className="wizard__lead">
                  Votre chanson sera composée puis envoyée à {who} sous {MUSIC_DELIVERY_DELAY_HOURS} h.
                </p>
              ) : null}
              <dl className="wizard__recap">
                <div>
                  <dt>Destinataire</dt>
                  <dd>
                    {recipientName.trim()}
                    {senderName.trim() ? ` · de la part de ${senderName.trim()}` : ''}
                    {occasion
                      ? ` · ${catalog.occasions.find((item) => item.code === occasion)?.label ?? occasion}`
                      : ''}
                  </dd>
                  <button type="button" onClick={() => goTo(0)}>Modifier</button>
                </div>
                <div>
                  <dt>Histoire</dt>
                  <dd className="wizard__recap-story">{prompt.trim()}</dd>
                  <button type="button" onClick={() => goTo(1)}>Modifier</button>
                </div>
                <div>
                  <dt>Style</dt>
                  <dd>
                    {labelOf(catalog.genres, genre)} · {labelOf(catalog.moods, mood)} ·{' '}
                    {labelOf(catalog.voices, voiceType)} · {labelOf(catalog.languages, language)}
                  </dd>
                  <button type="button" onClick={() => goTo(2)}>Modifier</button>
                </div>
                <div>
                  <dt>Paroles</dt>
                  <dd>
                    {MUSIC_LYRICS_MODES.find((item) => item.id === lyricsMode)?.label} ·{' '}
                    {labelOf(catalog.durations, durationSeconds)}
                  </dd>
                  <button type="button" onClick={() => goTo(3)}>Modifier</button>
                </div>
                <div>
                  <dt>Envoi</dt>
                  <dd>
                    Par {channelLabel(channel)} à {contact}
                    {recipientMessage.trim() ? ` · « ${recipientMessage.trim()} »` : ''}
                  </dd>
                  <button type="button" onClick={() => goTo(4)}>Modifier</button>
                </div>
              </dl>
            </div>
          ) : null}

          {step === LAST_STEP && !loggedIn ? (
            <p className="generate-page__note">
              Connectez-vous avec votre numéro de téléphone pour envoyer la chanson. Vos réponses sont
              conservées : vous reviendrez directement à ce récapitulatif.
            </p>
          ) : null}

          {generation.isPending ? (
            <div className="generate-page__status" aria-live="polite">
              <div className="generate-page__loader" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
              <p>
                {MUSIC_GENERATION_LIVE
                  ? `Composition de la chanson pour ${who}… Cela peut prendre quelques minutes. Dès qu’elle sera prête, le lien partira automatiquement par ${channelLabel(channel)}.`
                  : 'Enregistrement de votre demande…'}
              </p>
            </div>
          ) : null}

          {generation.isError ? (
            <p className="wizard__error" role="alert">
              {musicErrorMessage(generation.error)}
              {ApiHttpError.isInstance(generation.error) && generation.error.status === 401 ? (
                <>
                  {' '}
                  <a href={loginHref}>Se reconnecter</a>
                </>
              ) : null}
            </p>
          ) : null}

          <div className="wizard__nav">
            {step > 0 ? (
              <button
                type="button"
                className="ui-btn ui-btn--ghost"
                onClick={() => goTo(step - 1)}
                disabled={generation.isPending}
              >
                <FaArrowLeft aria-hidden="true" />
                Retour
              </button>
            ) : (
              <span />
            )}
            {step < LAST_STEP ? (
              <button type="submit" className="ui-btn ui-btn--primary">
                Continuer
                <FaArrowRight aria-hidden="true" />
              </button>
            ) : loggedIn ? (
              <button
                type="submit"
                className="ui-btn ui-btn--primary"
                disabled={!allValid || generation.isPending}
              >
                {generation.isPending
                  ? 'Envoi…'
                  : MUSIC_GENERATION_LIVE
                    ? 'Créer et envoyer la chanson'
                    : 'Valider ma demande'}
              </button>
            ) : (
              <a className="ui-btn ui-btn--primary" href={loginHref}>
                Se connecter pour envoyer
              </a>
            )}
          </div>
        </form>
      </div>
      {requestSent ? <RequestSentModal track={requestSent} onNewSong={startNewSong} /> : null}
    </main>
  )
}
