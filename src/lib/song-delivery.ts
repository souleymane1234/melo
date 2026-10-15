import { songShareUrl } from './music-routes'
import type { DeliveryChannel, MusicTrack } from './music-types'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim())
}

export function isValidPhone(value: string): boolean {
  return value.replace(/[^\d]/g, '').length >= 8
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
