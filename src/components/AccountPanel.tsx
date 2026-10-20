import { useEffect, useState, type FormEvent } from 'react'
import { ApiHttpError } from '../lib/api'
import type { ProfileDto, ProfileGender } from '../lib/api/modules/profile'
import {
  authUserFromDto,
  getAccessToken,
  getAuthEventName,
  getAuthUser,
  isApiLoggedIn,
  setAuthSession,
} from '../lib/auth-session'
import { MUSIC_ROUTES } from '../lib/music-routes'
import { logout, profileApi } from '../services/api-client'
import { PageLoader } from './PageLoader'
import './AccountPanel.css'

const GENDERS: { id: ProfileGender; label: string }[] = [
  { id: 'FEMALE', label: 'Femme' },
  { id: 'MALE', label: 'Homme' },
  { id: 'OTHER', label: 'Autre' },
  { id: 'PREFER_NOT_TO_SAY', label: 'Je préfère ne pas le dire' },
]

type ProfileForm = {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: ProfileGender | ''
  nationality: string
  residentialAddress: string
  city: string
  country: string
  bio: string
}

function toDateInput(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : ''
}

function toGender(value: string | null | undefined): ProfileGender | '' {
  return GENDERS.some((item) => item.id === value) ? (value as ProfileGender) : ''
}

function formFromAuthUser(): ProfileForm {
  const user = getAuthUser()
  return {
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    phone: user?.phoneNumber ?? '',
    dateOfBirth: toDateInput(user?.dateOfBirth),
    gender: toGender(user?.gender),
    nationality: user?.nationality ?? '',
    residentialAddress: user?.address ?? '',
    city: user?.city ?? '',
    country: user?.country ?? '',
    bio: user?.bio ?? '',
  }
}

function formFromApiProfile(profile: ProfileDto): ProfileForm {
  return {
    firstName: profile.firstName ?? '',
    lastName: profile.lastName ?? '',
    email: profile.email ?? '',
    phone: profile.phone ?? getAuthUser()?.phoneNumber ?? '',
    dateOfBirth: toDateInput(profile.dateOfBirth),
    gender: toGender(profile.gender),
    nationality: profile.nationality ?? '',
    residentialAddress: profile.residentialAddress ?? '',
    city: profile.city ?? '',
    country: profile.country ?? '',
    bio: profile.bio ?? '',
  }
}

function syncAuthUserFromProfile(profile: ProfileDto): void {
  const token = getAccessToken()
  if (!token) return
  setAuthSession({ accessToken: token, user: authUserFromDto(profile, getAuthUser()?.phoneNumber) })
}

function safeNext(): string | null {
  const next = new URLSearchParams(window.location.search).get('next')
  return next && next.startsWith('/') && !next.startsWith('//') ? next : null
}

function isWelcome(): boolean {
  return new URLSearchParams(window.location.search).get('bienvenue') === '1'
}

export function AccountPanel() {
  const [loggedIn, setLoggedIn] = useState(isApiLoggedIn)
  const [loading, setLoading] = useState(isApiLoggedIn)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [welcome, setWelcome] = useState(isWelcome)
  const [nextPath] = useState(safeNext)
  const [form, setForm] = useState<ProfileForm | null>(() => (isApiLoggedIn() ? formFromAuthUser() : null))

  useEffect(() => {
    const onChanged = () => {
      const nextLogged = isApiLoggedIn()
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
    if (!loggedIn) return
    let cancelled = false

    void (async () => {
      try {
        const profile = await profileApi.get()
        if (cancelled) return
        setForm(formFromApiProfile(profile))
        syncAuthUserFromProfile(profile)
      } catch (err) {
        if (cancelled) return
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
            Se connecter avec mon numéro
          </a>
        </div>
        <p>Un code vous est envoyé par SMS. Pas de mot de passe ; le compte est créé automatiquement.</p>
      </section>
    )
  }

  const update = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) =>
    setForm({ ...form, [key]: value })

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isApiLoggedIn()) {
      setError('Session expirée. Reconnectez-vous pour enregistrer.')
      return
    }
    setSaving(true)
    setSaved(false)
    setError('')
    const firstName = form.firstName.trim()
    const lastName = form.lastName.trim()
    try {
      const updated = await profileApi.update({
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        name: [firstName, lastName].filter(Boolean).join(' ') || undefined,
        email: form.email.trim() || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender || undefined,
        nationality: form.nationality.trim() || undefined,
        residentialAddress: form.residentialAddress.trim() || undefined,
        city: form.city.trim() || undefined,
        country: form.country.trim() || undefined,
        bio: form.bio.trim() || undefined,
      })
      setForm(formFromApiProfile(updated))
      syncAuthUserFromProfile(updated)
      setSaved(true)
      if (welcome) {
        setWelcome(false)
        window.history.replaceState(null, '', `${MUSIC_ROUTES.space}#compte`)
      }
    } catch (err) {
      setError(ApiHttpError.isInstance(err) ? err.message : 'Impossible d’enregistrer le profil.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="profil-page__inner">
      <header>
        <h2>{welcome ? 'Bienvenue ! Complétez votre profil' : 'Mon compte'}</h2>
        <p>
          {welcome
            ? 'Votre compte est créé. Ajoutez quelques informations pour personnaliser votre espace.'
            : 'Vos informations personnelles.'}
        </p>
      </header>

      {loading ? <PageLoader label="Chargement du profil…" /> : null}
      {error ? (
        <p className="profil-page__status profil-page__status--error" role="alert">
          {error}
        </p>
      ) : null}
      {saved ? (
        <div className="profil-page__saved" role="status">
          <p className="profil-page__status profil-page__status--ok">Profil enregistré.</p>
          <a className="ui-btn ui-btn--primary" href={nextPath ?? MUSIC_ROUTES.generate}>
            {nextPath === MUSIC_ROUTES.generate ? 'Continuer ma chanson' : 'Créer une chanson'}
          </a>
        </div>
      ) : null}

      <form className="profil-page__form ui-card" onSubmit={onSubmit}>
        <label>
          Prénom
          <input
            value={form.firstName}
            onChange={(event) => update('firstName', event.target.value)}
            autoComplete="given-name"
          />
        </label>
        <label>
          Nom
          <input
            value={form.lastName}
            onChange={(event) => update('lastName', event.target.value)}
            autoComplete="family-name"
          />
        </label>
        <label>
          Téléphone <span>(identifiant de connexion)</span>
          <input value={form.phone} readOnly autoComplete="tel" />
        </label>
        <label>
          Email <span>(optionnel)</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
            autoComplete="email"
          />
        </label>
        <label>
          Date de naissance
          <input
            type="date"
            value={form.dateOfBirth}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(event) => update('dateOfBirth', event.target.value)}
            autoComplete="bday"
          />
        </label>
        <label>
          Genre
          <select
            value={form.gender}
            onChange={(event) => update('gender', event.target.value as ProfileGender | '')}
          >
            <option value="">—</option>
            {GENDERS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Nationalité
          <input
            value={form.nationality}
            onChange={(event) => update('nationality', event.target.value)}
            placeholder="Ex. Ivoirienne"
          />
        </label>
        <label>
          Pays
          <input
            value={form.country}
            onChange={(event) => update('country', event.target.value)}
            autoComplete="country-name"
            placeholder="Ex. Côte d’Ivoire"
          />
        </label>
        <label>
          Ville
          <input
            value={form.city}
            onChange={(event) => update('city', event.target.value)}
            autoComplete="address-level2"
            placeholder="Ex. Abidjan"
          />
        </label>
        <label>
          Adresse
          <input
            value={form.residentialAddress}
            onChange={(event) => update('residentialAddress', event.target.value)}
            autoComplete="street-address"
            placeholder="Ex. Cocody, Riviera 2"
          />
        </label>
        <label className="profil-page__bio">
          Bio
          <textarea
            rows={4}
            value={form.bio}
            onChange={(event) => update('bio', event.target.value)}
            placeholder="Quelques mots sur vous…"
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
              void logout().finally(() => {
                window.location.href = '/'
              })
            }}
          >
            Déconnexion
          </button>
        </div>
      </form>
    </section>
  )
}
