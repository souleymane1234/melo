import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ApiHttpError } from '../lib/api'
import { authUserFromDto, getAuthEventName, isApiLoggedIn, setAuthSession } from '../lib/auth-session'
import { MUSIC_ROUTES } from '../lib/music-routes'
import { toE164 } from '../lib/phone'
import { authApi } from '../services/api-client'
import './AuthPages.css'

type Step = 'phone' | 'code'

function safeNext(): string | null {
  const next = new URLSearchParams(window.location.search).get('next')
  return next && next.startsWith('/') && !next.startsWith('//') ? next : null
}

function errorMessage(error: unknown, fallback: string): string {
  if (ApiHttpError.isInstance(error)) {
    if (error.status === 0) return 'Impossible de joindre le serveur. Vérifiez votre connexion.'
    if (error.status === 404) {
      return 'Service de connexion introuvable : l’adresse de l’API n’est pas configurée ou est incorrecte.'
    }
    if (error.status === 503) return 'Service momentanément indisponible. Réessayez dans un instant.'
    return error.message || fallback
  }
  return fallback
}

export function ConnexionPage() {
  const [loggedIn, setLoggedIn] = useState(isApiLoggedIn)
  const [step, setStep] = useState<Step>('phone')
  const [phoneInput, setPhoneInput] = useState('')
  const [phone, setPhone] = useState('')
  const [security, setSecurity] = useState('')
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const codeRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onChanged = () => setLoggedIn(isApiLoggedIn())
    window.addEventListener(getAuthEventName(), onChanged)
    window.addEventListener('storage', onChanged)
    return () => {
      window.removeEventListener(getAuthEventName(), onChanged)
      window.removeEventListener('storage', onChanged)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    if (step === 'code') codeRef.current?.focus()
  }, [step])

  const closeModal = () => {
    window.location.href = MUSIC_ROUTES.home
  }

  const onSubmitPhone = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const target = toE164(phoneInput)
    if (!target) {
      setMessage('Numéro invalide. Exemple : +225 07 07 07 07 07')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      const res = await authApi.sendPhoneCode({ phone_number: target })
      setPhone(target)
      setSecurity(res.data.security)
      setCode(import.meta.env.DEV ? (res.data.otp_code ?? '') : '')
      setStep('code')
    } catch (error) {
      setMessage(errorMessage(error, 'Impossible d’envoyer le code.'))
    } finally {
      setLoading(false)
    }
  }

  const onSubmitCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (code.length < 4) {
      setMessage('Saisissez le code reçu par SMS.')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      const res = await authApi.verifyPhoneCode({ security, code })
      if (!res.data?.access_token) {
        setMessage(res.message || 'Connexion impossible.')
        return
      }
      setAuthSession({
        accessToken: res.data.access_token,
        refreshToken: res.data.refresh_token,
        user: authUserFromDto(res.data.user, phone),
      })
      const next = safeNext()
      window.location.href = res.data.is_new_account
        ? `${MUSIC_ROUTES.space}?bienvenue=1${next ? `&next=${encodeURIComponent(next)}` : ''}#compte`
        : (next ?? `${MUSIC_ROUTES.space}#chansons`)
    } catch (error) {
      setMessage(errorMessage(error, 'Code invalide ou expiré.'))
    } finally {
      setLoading(false)
    }
  }

  const title = loggedIn ? 'Bienvenue' : step === 'phone' ? 'Connexion' : 'Code de vérification'
  const subtitle = loggedIn
    ? 'Vous êtes déjà connecté.'
    : step === 'phone'
      ? 'Entrez votre numéro de téléphone : nous vous envoyons un code par SMS. Pas de mot de passe.'
      : `Saisissez le code envoyé au ${phone}.`

  return (
    <div className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <div className="auth-modal__card">
        <button type="button" className="auth-modal__close" onClick={closeModal} aria-label="Fermer">
          ×
        </button>

        <header className="auth-modal__header">
          <img className="auth-modal__logo" src="/logo.png" alt="" />
          <div className="auth-modal__header-copy">
            <p className="auth-modal__brand">Votre chanson personnalisée</p>
            <h1 id="auth-modal-title">{title}</h1>
            <p className="auth-modal__subtitle">{subtitle}</p>
          </div>
        </header>

        {loggedIn ? (
          <div className="auth-modal__success">
            <a href={MUSIC_ROUTES.space} className="auth-modal__btn auth-modal__btn--primary">
              Ouvrir mon espace
            </a>
            <button type="button" className="auth-modal__btn auth-modal__btn--ghost" onClick={closeModal}>
              Retour à l’accueil
            </button>
          </div>
        ) : step === 'phone' ? (
          <form className="auth-modal__form" onSubmit={onSubmitPhone} noValidate>
            <label>
              Numéro de téléphone
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                autoFocus
                value={phoneInput}
                onChange={(event) => setPhoneInput(event.target.value)}
                placeholder="+225 07 07 07 07 07"
              />
            </label>
            <p className="auth-modal__hint">
              Avec l’indicatif du pays. Sans indicatif, un numéro à 10 chiffres est considéré comme ivoirien (+225).
            </p>
            {message ? (
              <p className="auth-modal__message" role="alert">
                {message}
              </p>
            ) : null}
            <div className="auth-modal__actions">
              <button
                type="submit"
                className="auth-modal__btn auth-modal__btn--primary"
                disabled={loading || phoneInput.trim().length < 8}
              >
                {loading ? 'Envoi…' : 'Recevoir le code'}
              </button>
            </div>
          </form>
        ) : (
          <form className="auth-modal__form" onSubmit={onSubmitCode} noValidate>
            <input
              ref={codeRef}
              className="auth-modal__code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={8}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              aria-label="Code de vérification"
            />
            {message ? (
              <p className="auth-modal__message" role="alert">
                {message}
              </p>
            ) : null}
            <div className="auth-modal__actions">
              <button
                type="submit"
                className="auth-modal__btn auth-modal__btn--primary"
                disabled={loading || code.length < 4}
              >
                {loading ? 'Vérification…' : 'Valider'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
