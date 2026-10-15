import { useEffect, useState } from 'react'
import { ApiHttpError } from '../lib/api'
import {
  getAuthEventName,
  isCandidateLoggedIn,
} from '../lib/candidate-auth'
import { setAuthSession } from '../lib/auth-session'
import { authApi } from '../services/api-client'
import { CaptchaField } from './CaptchaField'
import { PasswordInput } from './PasswordInput'
import './AuthPages.css'

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstName: '', lastName: '' }
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

function getInitialAuthMode(): 'login' | 'register' {
  const pathname = window.location.pathname
  const mode = new URLSearchParams(window.location.search).get('mode')
  if (pathname.startsWith('/inscription') || mode === 'register') return 'register'
  return 'login'
}

function syncAuthUrl(mode: 'login' | 'register') {
  const nextPath = mode === 'register' ? '/inscription' : '/connexion'
  if (window.location.pathname !== nextPath) {
    window.history.replaceState(null, '', nextPath)
  }
}

export function ConnexionPage() {
  const [mode, setMode] = useState<'login' | 'register'>(getInitialAuthMode)
  const [loggedIn, setLoggedIn] = useState(() => isCandidateLoggedIn())
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [loginCaptchaChecked, setLoginCaptchaChecked] = useState(false)
  const [registerCaptchaChecked, setRegisterCaptchaChecked] = useState(false)

  useEffect(() => {
    const onChanged = () => setLoggedIn(isCandidateLoggedIn())
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

  const closeModal = () => {
    window.location.href = '/#accueil'
  }

  return (
    <div
      className="auth-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={closeModal}
    >
      <div
        className="auth-modal__card"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="auth-modal__close"
          onClick={closeModal}
          aria-label="Fermer"
        >
          ×
        </button>

        <header className="auth-modal__header">
          <img
            className="auth-modal__logo"
            src="/logo.png"
            alt="Plateforme musicale"
          />
          <div className="auth-modal__header-copy">
            <p className="auth-modal__brand">Votre chanson personnalisée</p>
            <h1 id="auth-modal-title">
              {loggedIn ? 'Bienvenue' : mode === 'login' ? 'Connexion' : 'Inscription'}
            </h1>
            <p className="auth-modal__subtitle">
              {loggedIn
                ? 'Vous êtes déjà connecté. Retrouvez votre profil et vos créations dans Play.'
                : mode === 'login'
                  ? 'Connectez-vous pour retrouver vos chansons, les réécouter et les offrir.'
                  : 'Compte gratuit : sauvegardez vos créations et gardez-les privées, sans abonnement.'}
            </p>
          </div>
        </header>

        {loggedIn ? (
          <div className="auth-modal__success">
            <a href="/profil" className="auth-modal__btn auth-modal__btn--primary">
              Ouvrir mon profil
            </a>
            <button
              type="button"
              className="auth-modal__btn auth-modal__btn--ghost"
              onClick={closeModal}
            >
              Annuler
            </button>
          </div>
        ) : (
          <>
            <div className="auth-modal__tabs" role="tablist" aria-label="Mode d'authentification">
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'login'}
                className={`auth-modal__tab${mode === 'login' ? ' auth-modal__tab--active' : ''}`}
                onClick={() => {
                  setMode('login')
                  setMessage('')
                  setLoginCaptchaChecked(false)
                  setRegisterCaptchaChecked(false)
                  syncAuthUrl('login')
                }}
              >
                Connexion
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'register'}
                className={`auth-modal__tab${mode === 'register' ? ' auth-modal__tab--active' : ''}`}
                onClick={() => {
                  setMode('register')
                  setMessage('')
                  setLoginCaptchaChecked(false)
                  setRegisterCaptchaChecked(false)
                  syncAuthUrl('register')
                }}
              >
                Inscription
              </button>
            </div>

            {mode === 'register' ? (
              <form
                className="auth-modal__form auth-modal__form--register"
                onSubmit={async (event) => {
                  event.preventDefault()
                  if (!registerCaptchaChecked) {
                    setMessage('Veuillez confirmer que vous n\'êtes pas un robot.')
                    return
                  }
                  const fd = new FormData(event.currentTarget)
                  const fullName = String(fd.get('fullName') ?? '')
                  const email = String(fd.get('email') ?? '').trim().toLowerCase()
                  const password = String(fd.get('password') ?? '')
                  const confirm = String(fd.get('confirmPassword') ?? '')

                  if (password.length < 8) {
                    setMessage('Le mot de passe doit contenir au moins 8 caractères.')
                    return
                  }
                  if (password !== confirm) {
                    setMessage('Les mots de passe ne correspondent pas.')
                    return
                  }

                  const { firstName, lastName } = splitFullName(fullName)
                  setLoading(true)
                  setMessage('')
                  try {
                    const res = await authApi.register({
                      email,
                      password,
                      firstName: firstName || null,
                      lastName: lastName || null,
                    })
                    if (!res.data?.accessToken) {
                      setMessage(res.message || 'Inscription impossible.')
                      return
                    }
                    setAuthSession({
                      accessToken: res.data.accessToken,
                      refreshToken: res.data.refreshToken,
                      user: {
                        email: res.data.user?.email ?? email,
                        firstName: res.data.user?.firstName ?? firstName,
                        lastName: res.data.user?.lastName ?? lastName,
                        id: res.data.user?.id,
                        phoneNumber: res.data.user?.phoneNumber ?? undefined,
                        profileImage: res.data.user?.profileImage ?? undefined,
                        studentProfileId: res.data.user?.studentProfileId ?? undefined,
                        bio:
                          typeof res.data.user?.bio === 'string'
                            ? res.data.user.bio
                            : undefined,
                        city: res.data.user?.city ?? undefined,
                        country: res.data.user?.country ?? undefined,
                        address: res.data.user?.address ?? undefined,
                        gender: res.data.user?.gender ?? undefined,
                        nationality: res.data.user?.nationality ?? undefined,
                        dateOfBirth: res.data.user?.dateOfBirth ?? undefined,
                        academicLevel: res.data.user?.academicLevel ?? undefined,
                      },
                    })
                    window.location.href = '/mon-espace'
                  } catch (error) {
                    setMessage(
                      ApiHttpError.isInstance(error)
                        ? error.message
                        : 'Impossible de créer le compte. Vérifiez que l’API d’authentification est configurée.',
                    )
                  } finally {
                    setLoading(false)
                  }
                }}
              >
                <label>
                  Nom complet
                  <input
                    name="fullName"
                    required
                    autoComplete="name"
                    placeholder="Ex : Aminata Koné"
                  />
                </label>
                <label>
                  Email
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="vous@email.com"
                  />
                </label>
                <label>
                  Mot de passe
                  <PasswordInput
                    name="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="••••••••"
                  />
                </label>
                <label>
                  Confirmer le mot de passe
                  <PasswordInput
                    name="confirmPassword"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="••••••••"
                  />
                </label>
                <CaptchaField
                  checked={registerCaptchaChecked}
                  onChange={setRegisterCaptchaChecked}
                  disabled={loading}
                />
                {message ? <p className="auth-modal__message">{message}</p> : null}
                <div className="auth-modal__actions">
                  <button
                    type="button"
                    className="auth-modal__btn auth-modal__btn--ghost"
                    onClick={closeModal}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="auth-modal__btn auth-modal__btn--primary"
                    disabled={loading || !registerCaptchaChecked}
                  >
                    {loading ? 'Création…' : 'Créer mon compte'}
                  </button>
                </div>
              </form>
            ) : (
              <form
                className="auth-modal__form auth-modal__form--login"
                onSubmit={async (event) => {
                  event.preventDefault()
                  if (!loginCaptchaChecked) {
                    setMessage('Veuillez confirmer que vous n\'êtes pas un robot.')
                    return
                  }
                  const fd = new FormData(event.currentTarget)
                  const email = String(fd.get('email') ?? '').trim().toLowerCase()
                  const password = String(fd.get('password') ?? '')
                  setLoading(true)
                  setMessage('')
                  try {
                    const res = await authApi.login({ email, password })
                    if (!res.data?.accessToken) {
                      setMessage(res.message || 'Identifiants invalides.')
                      return
                    }
                    setAuthSession({
                      accessToken: res.data.accessToken,
                      refreshToken: res.data.refreshToken,
                      user: {
                        email: res.data.user?.email ?? email,
                        firstName: res.data.user?.firstName ?? undefined,
                        lastName: res.data.user?.lastName ?? undefined,
                        id: res.data.user?.id,
                        phoneNumber: res.data.user?.phoneNumber ?? undefined,
                        profileImage: res.data.user?.profileImage ?? undefined,
                        studentProfileId: res.data.user?.studentProfileId ?? undefined,
                        bio:
                          typeof res.data.user?.bio === 'string'
                            ? res.data.user.bio
                            : undefined,
                        city: res.data.user?.city ?? undefined,
                        country: res.data.user?.country ?? undefined,
                        address: res.data.user?.address ?? undefined,
                        gender: res.data.user?.gender ?? undefined,
                        nationality: res.data.user?.nationality ?? undefined,
                        dateOfBirth: res.data.user?.dateOfBirth ?? undefined,
                        academicLevel: res.data.user?.academicLevel ?? undefined,
                      },
                    })
                    window.location.href = '/mon-espace'
                  } catch (error) {
                    setMessage(
                      ApiHttpError.isInstance(error)
                        ? error.message
                        : 'Identifiants invalides. Vérifiez que l’API d’authentification est configurée.',
                    )
                  } finally {
                    setLoading(false)
                  }
                }}
              >
                <label>
                  Email
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="vous@email.com"
                  />
                </label>
                <label>
                  Mot de passe
                  <PasswordInput
                    name="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                  />
                </label>
                <CaptchaField
                  checked={loginCaptchaChecked}
                  onChange={setLoginCaptchaChecked}
                  disabled={loading}
                />
                {message ? <p className="auth-modal__message">{message}</p> : null}
                <div className="auth-modal__actions">
                  <button
                    type="button"
                    className="auth-modal__btn auth-modal__btn--ghost"
                    onClick={closeModal}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="auth-modal__btn auth-modal__btn--primary"
                    disabled={loading || !loginCaptchaChecked}
                  >
                    {loading ? 'Connexion…' : 'Se connecter'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}
