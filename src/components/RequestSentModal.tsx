import { useEffect, useRef } from 'react'
import { FaCheck, FaEnvelope, FaMessage, FaMusic } from 'react-icons/fa6'
import { MUSIC_DELIVERY_DELAY_HOURS } from '../config/app-config'
import { MUSIC_ROUTES } from '../lib/music-routes'
import type { MusicTrack } from '../lib/music-types'
import './RequestSentModal.css'

type RequestSentModalProps = {
  track: MusicTrack
  onNewSong: () => void
}

export function RequestSentModal({ track, onNewSong }: RequestSentModalProps) {
  const primaryRef = useRef<HTMLAnchorElement>(null)
  const recipient = track.recipient
  const name = recipient?.name ?? 'la personne'
  const isSms = recipient?.channel !== 'email'
  const contact = isSms ? recipient?.phone : recipient?.email

  useEffect(() => {
    primaryRef.current?.focus()
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onNewSong()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [onNewSong])

  return (
    <div className="request-modal" role="dialog" aria-modal="true" aria-labelledby="request-modal-title">
      <div className="request-modal__card">
        <button type="button" className="request-modal__close" onClick={onNewSong} aria-label="Fermer">
          ×
        </button>

        <div className="request-modal__badge" aria-hidden="true">
          <span className="request-modal__ring" />
          <span className="request-modal__check">
            <FaCheck />
          </span>
          <span className="request-modal__note request-modal__note--1">♪</span>
          <span className="request-modal__note request-modal__note--2">♫</span>
          <span className="request-modal__note request-modal__note--3">♪</span>
        </div>

        <h2 id="request-modal-title">Demande bien reçue !</h2>
        <p className="request-modal__lead">
          Votre chanson pour <strong>{name}</strong> est entre de bonnes mains. Elle sera composée et
          envoyée sous <strong>{MUSIC_DELIVERY_DELAY_HOURS}h</strong>.
        </p>

        <ul className="request-modal__steps">
          <li>
            <span aria-hidden="true">{isSms ? <FaMessage /> : <FaEnvelope />}</span>
            <p>
              {name} recevra le lien d’écoute par {isSms ? 'SMS' : 'e-mail'}
              {contact ? (
                <>
                  {' '}
                  au <strong>{contact}</strong>
                </>
              ) : null}
              .
            </p>
          </li>
          <li>
            <span aria-hidden="true">
              <FaMusic />
            </span>
            <p>Vous retrouverez la chanson et son avancement dans Mon espace.</p>
          </li>
        </ul>

        <div className="request-modal__actions">
          <a ref={primaryRef} className="ui-btn ui-btn--primary" href={`${MUSIC_ROUTES.space}#chansons`}>
            Voir Mon espace
          </a>
          <button type="button" className="ui-btn ui-btn--ghost" onClick={onNewSong}>
            Créer une autre chanson
          </button>
        </div>
      </div>
    </div>
  )
}
