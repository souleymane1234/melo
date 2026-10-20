import { useEffect, useMemo, useState } from 'react'
import { FaDownload } from 'react-icons/fa6'
import { useMyTracksQuery, useReceivedTracksQuery } from '../hooks/use-music-queries'
import { getAuthEventName, getAuthUser, isApiLoggedIn } from '../lib/auth-session'
import { isCandidateLoggedIn } from '../lib/candidate-auth'
import { getMusicLibraryEventName, readLocalTracks, readReceivedTracks } from '../lib/music-library'
import { MUSIC_ROUTES, songPath } from '../lib/music-routes'
import type { MusicTrack } from '../lib/music-types'
import { channelLabel } from '../lib/song-delivery'
import { AccountPanel } from './AccountPanel'
import { EmptyState } from './EmptyState'
import { PageLoader } from './PageLoader'
import { SongCard } from './SongCard'
import { SongDelivery } from './SongDelivery'
import { TrackStatus } from './TrackStatus'
import './MonEspacePage.css'

type SpaceTab = 'chansons' | 'recues' | 'compte'

const TABS: { id: SpaceTab; label: string }[] = [
  { id: 'chansons', label: 'Mes chansons' },
  { id: 'recues', label: 'Chansons reçues' },
  { id: 'compte', label: 'Mon compte' },
]

function tabFromHash(): SpaceTab {
  const hash = window.location.hash.replace('#', '')
  return TABS.some((tab) => tab.id === hash) ? (hash as SpaceTab) : 'chansons'
}

function mergeTracks(remote: MusicTrack[] | undefined, local: MusicTrack[]): MusicTrack[] {
  const byId = new Map<string, MusicTrack>()
  for (const track of local) byId.set(track.id, track)
  for (const track of remote ?? []) byId.set(track.id, { ...byId.get(track.id), ...track })
  return [...byId.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

function useLocalLibrary() {
  const [created, setCreated] = useState(() => readLocalTracks())
  const [received, setReceived] = useState(() => readReceivedTracks())
  useEffect(() => {
    const refresh = () => {
      setCreated(readLocalTracks())
      setReceived(readReceivedTracks())
    }
    window.addEventListener(getMusicLibraryEventName(), refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(getMusicLibraryEventName(), refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])
  return { created, received }
}

function useLoggedIn() {
  const [loggedIn, setLoggedIn] = useState(() => isApiLoggedIn() || isCandidateLoggedIn())
  useEffect(() => {
    const refresh = () => setLoggedIn(isApiLoggedIn() || isCandidateLoggedIn())
    window.addEventListener(getAuthEventName(), refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(getAuthEventName(), refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])
  return loggedIn
}

export function MonEspacePage() {
  const [tab, setTab] = useState<SpaceTab>(tabFromHash)
  const loggedIn = useLoggedIn()
  const local = useLocalLibrary()
  const mine = useMyTracksQuery(isApiLoggedIn())
  const receivedRemote = useReceivedTracksQuery(isApiLoggedIn())

  const created = useMemo(() => mergeTracks(mine.data, local.created), [mine.data, local.created])
  const received = useMemo(
    () => mergeTracks(receivedRemote.data, local.received),
    [receivedRemote.data, local.received],
  )

  useEffect(() => {
    const onHash = () => setTab(tabFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const selectTab = (next: SpaceTab) => {
    setTab(next)
    window.history.replaceState(null, '', `${MUSIC_ROUTES.space}#${next}`)
  }

  const user = loggedIn ? getAuthUser() : null
  const greeting = user?.firstName ? `Bonjour ${user.firstName}` : 'Mon espace'
  const counts: Record<SpaceTab, number | null> = {
    chansons: created.length,
    recues: received.length,
    compte: null,
  }

  return (
    <main className="page-main mon-espace">
      <div className="ui-container mon-espace__inner">
        <header className="mon-espace__header">
          <p className="ui-eyebrow">Mon espace</p>
          <h1>{greeting}</h1>
          <p>
            Retrouvez les chansons que vous avez créées et envoyées, celles qu’on vous a offertes,
            et votre compte.
          </p>
        </header>

        <div className="mon-espace__tabs" role="tablist" aria-label="Sections de mon espace">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={`mon-espace__tab${tab === item.id ? ' is-active' : ''}`}
              onClick={() => selectTab(item.id)}
            >
              {item.label}
              {counts[item.id] !== null ? (
                <span className="mon-espace__count">{counts[item.id]}</span>
              ) : null}
            </button>
          ))}
        </div>

        {tab === 'chansons' && mine.isError ? (
          <p className="mon-espace__error" role="alert">
            Impossible de récupérer vos chansons pour le moment. Réessayez dans un instant.
          </p>
        ) : null}

        {tab === 'chansons' ? (
          mine.isLoading && created.length === 0 ? (
            <PageLoader label="Chargement de vos chansons…" />
          ) : created.length === 0 ? (
            <EmptyState
              title="Vous n’avez pas encore créé de chanson"
              description="Racontez votre histoire, choisissez à qui l’offrir : la personne reçoit le lien par SMS ou e-mail."
              action={
                <a className="ui-btn ui-btn--primary" href={MUSIC_ROUTES.generate}>
                  Créer une chanson
                </a>
              }
            />
          ) : (
            <ul className="mon-espace__list">
              {created.map((track) => {
                const available = track.status === 'completed' && Boolean(track.audioUrl)
                return (
                  <li
                    key={track.id}
                    className={`mon-espace__item ui-card${available ? '' : ' mon-espace__item--waiting'}`}
                  >
                    {available ? (
                      <SongCard track={track} href={songPath(track.id)} showPlayer />
                    ) : null}
                    <div className="mon-espace__details">
                      {!available ? <h3 className="mon-espace__title">{track.title}</h3> : null}
                      {track.recipient ? (
                        <p className="mon-espace__meta">
                          Pour <strong>{track.recipient.name}</strong> · par{' '}
                          {channelLabel(track.recipient.channel)}
                          {track.recipient.channel === 'sms' && track.recipient.phone
                            ? ` (${track.recipient.phone})`
                            : ''}
                          {track.recipient.channel === 'email' && track.recipient.email
                            ? ` (${track.recipient.email})`
                            : ''}
                        </p>
                      ) : null}
                      <TrackStatus track={track} />
                      {available ? (
                        <>
                          <SongDelivery track={track} compact showStatus={false} />
                          <a className="mon-espace__download" href={track.audioUrl} download>
                            <FaDownload aria-hidden="true" /> Télécharger
                          </a>
                        </>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ul>
          )
        ) : null}

        {tab === 'recues' ? (
          received.length === 0 ? (
            <EmptyState
              title="Aucune chanson reçue pour l’instant"
              description="Quand quelqu’un vous offre une chanson, ouvrez le lien reçu par SMS ou e-mail : elle apparaîtra ici."
            />
          ) : (
            <ul className="mon-espace__list">
              {received.map((track) => (
                <li key={track.id} className="mon-espace__item ui-card">
                  <SongCard track={track} href={songPath(track.id)} showPlayer />
                  <div className="mon-espace__details">
                    {track.recipient?.senderName ? (
                      <p className="mon-espace__meta">
                        De la part de <strong>{track.recipient.senderName}</strong>
                      </p>
                    ) : null}
                    {track.recipient?.message ? (
                      <p className="mon-espace__quote">« {track.recipient.message} »</p>
                    ) : null}
                    <div className="mon-espace__actions">
                      <a className="ui-btn ui-btn--primary" href={track.audioUrl} download>
                        <FaDownload aria-hidden="true" /> Télécharger
                      </a>
                      <a className="ui-btn ui-btn--ghost" href={songPath(track.id)}>
                        Ouvrir
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : null}

        {tab === 'compte' ? <AccountPanel /> : null}
      </div>
    </main>
  )
}
