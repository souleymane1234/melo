import { useState } from 'react'
import { FaCheck, FaEnvelope, FaLink, FaMessage } from 'react-icons/fa6'
import { songShareUrl } from '../lib/music-routes'
import type { MusicTrack } from '../lib/music-types'
import { channelLabel, mailtoHref, smsHref } from '../lib/song-delivery'
import './SongDelivery.css'

type SongDeliveryProps = {
  track: MusicTrack
  compact?: boolean
  showStatus?: boolean
}

function statusText(track: MusicTrack): string {
  const recipient = track.recipient
  const who = recipient?.name ?? 'la personne'
  const via = recipient ? channelLabel(recipient.channel) : ''
  switch (track.deliveryStatus) {
    case 'sent':
      return `Le lien a été envoyé à ${who} par ${via}. Vous pouvez aussi le partager vous-même :`
    case 'pending':
      return `Le lien sera envoyé automatiquement à ${who} par ${via}. Vous pouvez aussi le partager vous-même :`
    case 'failed':
      return `L’envoi automatique a échoué. Envoyez le lien à ${who} avec les boutons ci-dessous.`
    default:
      return recipient
        ? `Envoyez le lien à ${who} : il pourra écouter et télécharger la chanson.`
        : 'Envoyez le lien : la personne pourra écouter et télécharger la chanson.'
  }
}

export function SongDelivery({ track, compact = false, showStatus = true }: SongDeliveryProps) {
  const [copied, setCopied] = useState(false)
  const channel = track.recipient?.channel ?? 'email'
  const sentByServer = track.deliveryStatus === 'sent' || track.deliveryStatus === 'pending'
  const variant = (preferred: boolean) => (preferred && !sentByServer ? 'ui-btn--primary' : 'ui-btn--ghost')

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(songShareUrl(track.id))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const emailButton = (
    <a
      key="email"
      className={`ui-btn ${variant(channel === 'email')}`}
      href={mailtoHref(track)}
    >
      <FaEnvelope aria-hidden="true" />
      Par e-mail
    </a>
  )
  const smsButton = (
    <a
      key="sms"
      className={`ui-btn ${variant(channel === 'sms')}`}
      href={smsHref(track)}
    >
      <FaMessage aria-hidden="true" />
      Par SMS
    </a>
  )

  return (
    <div className={`song-delivery${compact ? ' song-delivery--compact' : ''}`}>
      {showStatus ? (
        <p className={`song-delivery__status song-delivery__status--${track.deliveryStatus ?? 'idle'}`}>
          {statusText(track)}
        </p>
      ) : null}
      <div className="song-delivery__actions">
        {channel === 'sms' ? [smsButton, emailButton] : [emailButton, smsButton]}
        <button type="button" className="ui-btn ui-btn--ghost" onClick={() => void copyLink()}>
          {copied ? <FaCheck aria-hidden="true" /> : <FaLink aria-hidden="true" />}
          {copied ? 'Lien copié' : 'Copier le lien'}
        </button>
      </div>
    </div>
  )
}
