import { useEffect, useState } from 'react'
import { ApiHttpError } from '../lib/api'
import type { StudentProfileResponseDto } from '../lib/api/modules/profile'
import {
  clearAuthSession,
  getAccessToken,
  getAuthEventName,
  getAuthUser,
  isApiLoggedIn,
  setAuthSession,
} from '../lib/auth-session'
import { isCandidateLoggedIn, logoutCandidate } from '../lib/candidate-auth'
import { MUSIC_ROUTES } from '../lib/music-routes'
import { profileApi } from '../services/api-client'
import { PageLoader } from './PageLoader'
import './AccountPanel.css'

type ProfileForm = {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  city: string
  country: string
  bio: string
}

function emptyForm(email = ''): ProfileForm {
  return {
    firstName: '',
    lastName: '',
    email,
    phoneNumber: '',
    city: '',
    country: '',
    bio: '',
  }
}

function formFromAuthUser(): ProfileForm {
  const user = getAuthUser()
  return {
    ...emptyForm(user?.email ?? ''),
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    phoneNumber: user?.phoneNumber ?? '',
    city: user?.city ?? '',
    country: user?.country ?? '',
    bio: user?.bio ?? '',
  }
}

function formFromApiProfile(profile: StudentProfileResponseDto, emailFallback: string): ProfileForm {
  return {
    firstName: profile.firstName ?? '',
    lastName: profile.lastName ?? '',
    email: emailFallback,
    phoneNumber: profile.phoneNumber ?? '',
    city: profile.city ?? '',
    country: profile.country ?? '',
    bio: profile.bio ?? '',
  }
}

function syncAuthUserFromProfile(profile: StudentProfileResponseDto): void {
  const token = getAccessToken()
  const current = getAuthUser()
  if (!token || !current) return
  setAuthSession({
    accessToken: token,
    user: {
      ...current,
      firstName: profile.firstName ?? current.firstName,
      lastName: profile.lastName ?? current.lastName,
      phoneNumber: profile.phoneNumber ?? current.phoneNumber,
      bio: profile.bio ?? current.bio,
      city: profile.city ?? current.city,
      country: profile.country ?? current.country,
    },
  })
}

export function AccountPanel() {
  const [loggedIn, setLoggedIn] = useState(() => isApiLoggedIn() || isCandidateLoggedIn())
  const [loading, setLoading] = useState(() => isApiLoggedIn())
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<ProfileForm | null>(() =>
    isApiLoggedIn() || isCandidateLoggedIn() ? formFromAuthUser() : null,
  )

  useEffect(() => {
    const onChanged = () => {
      const nextLogged = isApiLoggedIn() || isCandidateLoggedIn()
      setLoggedIn(nextLogged)
      if (!nextLogged) {
        setForm(null)
        setLoading(false)
      }
    }
    window.addEventListener(getAuthEventName(), onChanged)
    window.addEventListener('storage', onChanged)
    return () => {
      window.removeEventListener(getAuthEventName(), onChanged)
      window.removeEventListener('storage', onChanged)
    }
  }, [])

  useEffect(() => {
    if (!loggedIn || !isApiLoggedIn()) {
      return
    }

    let cancelled = false

    void (async () => {
      setError('')
      try {
        const profile = await profileApi.get()
        if (cancelled) return
        const email = getAuthUser()?.email ?? ''
        setForm(formFromApiProfile(profile, email))
        syncAuthUserFromProfile(profile)
      } catch (err) {
        if (cancelled) return
        if (ApiHttpError.isInstance(err) && err.status === 404) {
          setForm((prev) => prev ?? formFromAuthUser())
          return
        }
        setError(ApiHttpError.isInstance(err) ? err.message : 'Impossible de charger le profil.')
        setForm((prev) => prev ?? formFromAuthUser())
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [loggedIn])

  if (!loggedIn || !form) {
    return (
      <section className="profil-page__gate ui-card">
        <h2>Connectez-vous</h2>
        <p>
          Un compte vous permet de retrouver vos chansons et celles qu’on vous a offertes sur tous vos
          appareils. Sans compte, elles restent enregistrées sur cet appareil.
        </p>
        <div className="profil-page__actions">
          <a href={MUSIC_ROUTES.login} className="ui-btn ui-btn--primary">
            Se connecter
          </a>
          <a href={MUSIC_ROUTES.register} className="ui-btn ui-btn--ghost">
            Créer un compte
          </a>
        </div>
      </section>
    )
  }

  return (
    <section className="profil-page__inner">
      <header>
        <h2>Mon compte</h2>
        <p>Vos informations personnelles.</p>
      </header>

        {loading ? <PageLoader label="Chargement du profil…" /> : null}
        {error ? (
          <p className="profil-page__status profil-page__status--error" role="alert">
            {error}
          </p>
        ) : null}
        {saved ? (
          <p className="profil-page__status profil-page__status--ok" role="status">
            Profil enregistré.
          </p>
        ) : null}

        <form
          className="profil-page__form ui-card"
          onSubmit={async (event) => {
            event.preventDefault()
            if (!isApiLoggedIn()) {
              setError('Session expirée. Reconnectez-vous pour enregistrer.')
              return
            }
            setSaving(true)
            setSaved(false)
            setError('')
            try {
              const updated = await profileApi.update({
                firstName: form.firstName.trim() || undefined,
                lastName: form.lastName.trim() || undefined,
                phoneNumber: form.phoneNumber.trim() || undefined,
                bio: form.bio.trim() || undefined,
                city: form.city.trim() || undefined,
                country: form.country.trim() || undefined,
              })
              setForm(formFromApiProfile(updated, form.email))
              syncAuthUserFromProfile(updated)
              setSaved(true)
              window.setTimeout(() => setSaved(false), 2200)
            } catch (err) {
              setError(ApiHttpError.isInstance(err) ? err.message : 'Impossible d’enregistrer le profil.')
            } finally {
              setSaving(false)
            }
          }}
        >
          <label>
            Prénom
            <input
              value={form.firstName}
              onChange={(event) => setForm({ ...form, firstName: event.target.value })}
              autoComplete="given-name"
            />
          </label>
          <label>
            Nom
            <input
              value={form.lastName}
              onChange={(event) => setForm({ ...form, lastName: event.target.value })}
              autoComplete="family-name"
            />
          </label>
          <label>
            Email
            <input value={form.email} readOnly autoComplete="email" />
          </label>
          <label>
            Téléphone
            <input
              value={form.phoneNumber}
              onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })}
              autoComplete="tel"
            />
          </label>
          <label>
            Ville
            <input
              value={form.city}
              onChange={(event) => setForm({ ...form, city: event.target.value })}
              autoComplete="address-level2"
            />
          </label>
          <label>
            Pays
            <input
              value={form.country}
              onChange={(event) => setForm({ ...form, country: event.target.value })}
              autoComplete="country-name"
            />
          </label>
          <label className="profil-page__bio">
            Bio
            <textarea
              rows={4}
              value={form.bio}
              onChange={(event) => setForm({ ...form, bio: event.target.value })}
              placeholder="Quelques mots sur votre univers musical…"
            />
          </label>
          <div className="profil-page__actions">
            <button type="submit" className="ui-btn ui-btn--primary" disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <button
              type="button"
              className="ui-btn ui-btn--ghost"
              onClick={() => {
                logoutCandidate()
                clearAuthSession()
                window.location.href = '/'
              }}
            >
              Déconnexion
            </button>
          </div>
        </form>
    </section>
  )
}
