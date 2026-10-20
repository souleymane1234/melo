import { useEffect, useMemo } from 'react'
import { FaDownload } from 'react-icons/fa6'
import { useTrackQuery } from '../hooks/use-music-queries'
import { getLocalTrack, getReceivedTrack, saveReceivedTrack } from '../lib/music-library'
import { genreLabel, moodLabel } from '../lib/music-options'
import { MUSIC_ROUTES } from '../lib/music-routes'
import { trackStatusText } from '../lib/song-delivery'
import { AudioPlayer } from './AudioPlayer'
import { EmptyState } from './EmptyState'
import { PageLoader } from './PageLoader'
import { SongDelivery } from './SongDelivery'
import './SongDetailPage.css'

export function SongDetailPage({ id }: { id?: string }) {
  const resolvedId = id ?? ''
  const ownTrack = useMemo(() => (resolvedId ? getLocalTrack(resolvedId) : null), [resolvedId])
  const storedReceived = useMemo(
    () => (resolvedId && !ownTrack ? getReceivedTrack(resolvedId) : null),
    [resolvedId, ownTrack],
  )
  const remote = useTrackQuery(ownTrack || storedReceived ? undefined : resolvedId)
  const track = ownTrack ?? storedReceived ?? remote.data ?? null
  const isOwner = Boolean(ownTrack) || Boolean(remote.data?.prompt)

  useEffect(() => {
    if (!isOwner && track?.audioUrl && track.status === 'completed') {
      saveReceivedTrack({ ...track, source: 'local' })
    }
  }, [isOwner, track])

  if (!resolvedId) {
    return (
      <main className="page-main">
        <div className="ui-container song-detail">
          <EmptyState title="Chanson introuvable" description="Le lien semble incomplet." />
        </div>
      </main>
    )
  }

  if (!track && remote.isLoading) {
    return (
      <main className="page-main">
        <PageLoader fullPage label="Chargement de votre chanson…" />
      </main>
    )
  }

  if (!track) {
    return (
      <main className="page-main">
        <div className="ui-container song-detail">
          <EmptyState
            title="Cette chanson n’est pas disponible"
            description="Le lien est peut-être expiré, ou la chanson n’est pas encore hébergée sur la plateforme."
            action={
              <a className="ui-btn ui-btn--primary" href={MUSIC_ROUTES.generate}>
                Créer une chanson
              </a>
            }
          />
        </div>
      </main>
    )
  }

  const recipient = track.recipient
  const created = track.createdAt
    ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(track.createdAt))
    : null

  return (
    <main className="page-main">
      <div className="ui-container song-detail">
        <a className="song-detail__back" href={MUSIC_ROUTES.space}>
          ← Mon espace
        </a>

        <header className="song-detail__header">
          <p className="ui-eyebrow">
            {isOwner
              ? recipient
                ? `Votre chanson pour ${recipient.name}`
                : 'Votre chanson'
              : recipient?.senderName
                ? `Une chanson de ${recipient.senderName}`
                : 'Une chanson pour vous'}
          </p>
          <h1>{track.title}</h1>
          <p className="song-detail__date">
            {genreLabel(track.genre)} · {moodLabel(track.mood)}
            {created ? ` · ${created}` : ''}
          </p>
        </header>

        {recipient?.message ? (
          <blockquote className="song-detail__message ui-card">
            <p>« {recipient.message} »</p>
            {recipient.senderName ? <cite>— {recipient.senderName}</cite> : null}
          </blockquote>
        ) : null}

        {track.audioUrl ? (
          <AudioPlayer track={track} />
        ) : (
          <p className="song-detail__status ui-card">{trackStatusText(track)}</p>
        )}

        <div className="song-detail__actions">
          {track.audioUrl ? (
            <a className="ui-btn ui-btn--primary" href={track.audioUrl} download>
              <FaDownload aria-hidden="true" />
              Télécharger la chanson
            </a>
          ) : null}
          {!isOwner ? (
            <a className="ui-btn ui-btn--ghost" href={MUSIC_ROUTES.generate}>
              Offrir une chanson à mon tour
            </a>
          ) : null}
        </div>

        {isOwner && track.audioUrl ? (
          <section className="song-detail__panel ui-card">
            <h2>Envoyer le lien</h2>
            <SongDelivery track={track} />
          </section>
        ) : null}

        {track.lyrics ? (
          <section className="song-detail__panel ui-card">
            <h2>Paroles</h2>
            <pre>{track.lyrics}</pre>
          </section>
        ) : null}
      </div>
    </main>
  )
}
