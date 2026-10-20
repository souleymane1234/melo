import { MUSIC_DELIVERY_DELAY_HOURS, MUSIC_GENERATION_LIVE } from '../config/app-config'
import { songShareUrl } from './music-routes'
import { toE164 } from './phone'
import type { DeliveryChannel, DeliveryStatus, MusicTrack, MusicTrackStatus } from './music-types'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim())
}

export function isValidPhone(value: string): boolean {
  return toE164(value) !== null
}

export function channelLabel(channel: DeliveryChannel): string {
  return channel === 'sms' ? 'SMS' : 'e-mail'
}

function shareMessage(track: MusicTrack): string {
  const recipient = track.recipient
  const greeting = recipient?.name ? `${recipient.name}, ` : ''
  const from = recipient?.senderName ? `${recipient.senderName} t’offre` : 'quelqu’un t’offre'
  const note = recipient?.message ? `\n\n« ${recipient.message} »` : ''
  return `${greeting}${from} une chanson : « ${track.title} ».${note}\n\nÉcoute-la et télécharge-la ici : ${songShareUrl(track.id)}`
}

export function mailtoHref(track: MusicTrack): string {
  const to = track.recipient?.email ?? ''
  const subject = encodeURIComponent(`Une chanson pour toi : ${track.title}`)
  const body = encodeURIComponent(shareMessage(track))
  return `mailto:${to}?subject=${subject}&body=${body}`
}

export function smsHref(track: MusicTrack): string {
  const phone = (track.recipient?.phone ?? '').replace(/[^\d+]/g, '')
  return `sms:${phone}?body=${encodeURIComponent(shareMessage(track))}`
}

/**
 * Statut présenté à l’utilisateur. Tant que la génération n’est pas branchée, l’état renvoyé par
 * l’API est ignoré : la demande reste « en cours » jusqu’à ce qu’un vrai fichier audio existe.
 * Ensuite, une demande n’est présentée en échec que si l’envoi lui-même a échoué.
 */
export function displayedStatus(
  status: MusicTrackStatus,
  deliveryStatus: DeliveryStatus | undefined,
  audioUrl: string | undefined,
): MusicTrackStatus {
  if (!MUSIC_GENERATION_LIVE) return status === 'completed' && audioUrl ? 'completed' : 'pending'
  if (status === 'failed' && deliveryStatus !== 'failed') return 'pending'
  return status
}

/** Date de livraison annoncée : date de la demande + délai de traitement. */
export function expectedDeliveryDate(track: MusicTrack): Date | null {
  const created = new Date(track.createdAt)
  if (Number.isNaN(created.getTime())) return null
  return new Date(created.getTime() + MUSIC_DELIVERY_DELAY_HOURS * 3_600_000)
}

export function trackStatusText(track: MusicTrack): string | null {
  switch (displayedStatus(track.status, track.deliveryStatus, track.audioUrl)) {
    case 'pending':
      return MUSIC_GENERATION_LIVE
        ? 'En attente de composition…'
        : `Demande en cours : la chanson sera prête et envoyée sous ${MUSIC_DELIVERY_DELAY_HOURS} h.`
    case 'processing':
      return 'Composition en cours… Le lien partira automatiquement une fois la chanson prête.'
    case 'failed':
      return track.error ? `La génération a échoué : ${track.error}` : 'La génération a échoué.'
    default:
      return null
  }
}
