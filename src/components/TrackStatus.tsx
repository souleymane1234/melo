import { MUSIC_DELIVERY_DELAY_HOURS, MUSIC_GENERATION_LIVE } from '../config/app-config'
import { useTrackJobQuery } from '../hooks/use-music-queries'
import type { MusicTrack, MusicTrackStatus } from '../lib/music-types'
import { channelLabel, displayedStatus, expectedDeliveryDate } from '../lib/song-delivery'
import './TrackStatus.css'

const BADGES: Record<MusicTrackStatus, string> = {
  pending: MUSIC_GENERATION_LIVE ? 'En attente de création' : 'Demande en cours',
  processing: 'En cours de création',
  completed: 'Prête',
  failed: 'Création impossible',
}

function formatDate(value: string | undefined, withTime = false): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    ...(withTime ? { timeStyle: 'short' } : {}),
  }).format(date)
}

function statusMessage(track: MusicTrack, status: MusicTrackStatus, error?: string): string {
  const name = track.recipient?.name ?? 'la personne'
  const via = track.recipient ? channelLabel(track.recipient.channel) : 'SMS ou e-mail'
  switch (status) {
    case 'pending': {
      if (MUSIC_GENERATION_LIVE) {
        return `Votre demande est enregistrée. La composition de la chanson pour ${name} va bientôt commencer.`
      }
      const due = expectedDeliveryDate(track)
      if (due && due.getTime() <= Date.now()) {
        return `Votre demande est en cours de finalisation : la chanson pour ${name} lui sera envoyée par ${via} très prochainement.`
      }
      const dueText = due ? formatDate(due.toISOString(), true) : null
      return dueText
        ? `Votre demande est en cours de traitement. La chanson pour ${name} sera composée et envoyée par ${via} au plus tard le ${dueText}.`
        : `Votre demande est en cours de traitement. La chanson pour ${name} sera composée et envoyée par ${via} sous ${MUSIC_DELIVERY_DELAY_HOURS} h.`
    }
    case 'processing':
      return `La chanson pour ${name} est en cours de composition. Le lien lui sera envoyé par ${via} dès qu’elle sera prête.`
    case 'failed':
      return `${error ?? 'La création de la chanson a échoué.'} Votre crédit a été restitué : vous pouvez refaire une demande.`
    case 'completed': {
      const sentAt = formatDate(track.deliveredAt, true)
      if (track.deliveryStatus === 'sent') {
        return `La chanson a été envoyée à ${name} par ${via}${sentAt ? ` le ${sentAt}` : ''}.`
      }
      if (track.deliveryStatus === 'failed') {
        return `La chanson est prête, mais l’envoi à ${name} a échoué. Partagez le lien vous-même ci-dessous.`
      }
      return `La chanson est prête. Le lien est en cours d’envoi à ${name} par ${via}.`
    }
  }
}

export function TrackStatus({ track }: { track: MusicTrack }) {
  const job = useTrackJobQuery(track)
  const live = job.data?.track ? { ...track, ...job.data.track } : track
  const status = displayedStatus(job.data?.status ?? track.status, live.deliveryStatus, live.audioUrl)
  const error = job.data?.error ?? track.error
  const requestedAt = formatDate(track.createdAt)

  return (
    <div className={`track-status track-status--${status}`} role="status">
      <p className="track-status__badge">
        <span className="track-status__dot" aria-hidden="true" />
        {BADGES[status]}
      </p>
      <p className="track-status__message">{statusMessage(live, status, error)}</p>
      {requestedAt && status !== 'completed' ? (
        <p className="track-status__date">Demande du {requestedAt}</p>
      ) : null}
    </div>
  )
}
