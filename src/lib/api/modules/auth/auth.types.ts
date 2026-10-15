export interface AuthSocialLinkDto {
  platform: string
  url: string
  logoUrl?: string | null
}

/** Utilisateur aplati (login / register-without-confirm / verify-email). */
export interface AuthUserDto {
  id: string
  email: string
  role?: string | null
  emailVerifie?: boolean
  premiumActif?: boolean
  studentProfileId?: string | null
  phoneNumber?: string | null
  firstName?: string | null
  lastName?: string | null
  bio?: unknown
  videoPresentationUrl?: string | null
  dateOfBirth?: string | null
  gender?: string | null
  nationality?: string | null
  address?: string | null
  city?: string | null
  country?: string | null
  profileImage?: string | null
  coverImage?: unknown
  interests?: string[] | null
  socialLinks?: AuthSocialLinkDto[] | null
  academicLevel?: string | null
  hasForeignFile?: boolean
  hasScholarshipFile?: boolean
  studentProfileCreatedAt?: string | null
  studentProfileUpdatedAt?: string | null
}

export interface AuthTokensDto {
  accessToken: string
  refreshToken?: string | null
  user?: AuthUserDto | null
}

export interface AuthEnvelopeDto {
  success: boolean
  message: string
  data: AuthTokensDto
}

export interface LoginBodyDto {
  email: string
  password: string
}

/** POST /auth/register-without-confirm */
export interface RegisterBodyDto {
  email: string
  password: string
  firstName?: string | null
  lastName?: string | null
}

export interface RefreshBodyDto {
  refreshToken: string
}

export interface RefreshEnvelopeDto {
  success: boolean
  message?: string
  data: {
    accessToken: string
    refreshToken?: string | null
  }
}
