export type ProfileGender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'

/** Réponse GET/PATCH /api/v1/profile/me (champ `data`). */
export interface ProfileDto {
  id: string
  email?: string | null
  phone?: string | null
  avatarUrl?: string | null
  firstName?: string | null
  lastName?: string | null
  name?: string | null
  role?: string | null
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  dateOfBirth?: string | null
  gender?: ProfileGender | null
  residentialAddress?: string | null
  bio?: string | null
  city?: string | null
  country?: string | null
  nationality?: string | null
  unreadNotificationsCount?: number
}

/** Corps PATCH /api/v1/profile/me */
export interface UpdateProfileDto {
  firstName?: string
  lastName?: string
  name?: string
  email?: string
  avatarUrl?: string
  dateOfBirth?: string
  gender?: ProfileGender
  residentialAddress?: string
  bio?: string
  city?: string
  country?: string
  nationality?: string
}

export interface ProfileEnvelopeDto {
  success: boolean
  message?: string
  data: ProfileDto
}
