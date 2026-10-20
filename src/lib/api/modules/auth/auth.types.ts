export type PhoneAuthRequestType = 'NEW_ACCOUNT' | 'EXISTING_ACCOUNT'

export interface AuthUserDto {
  id: string
  email?: string | null
  phone?: string | null
  avatarUrl?: string | null
  firstName?: string | null
  lastName?: string | null
  name?: string | null
  role?: string | null
  adminLevel?: string | null
  emailVerified?: boolean
  phoneVerified?: boolean
  dateOfBirth?: string | null
  gender?: string | null
  residentialAddress?: string | null
  bio?: string | null
  city?: string | null
  country?: string | null
  nationality?: string | null
}

interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

/** POST /auth/phone/send-code */
export interface PhoneSendCodeBodyDto {
  phone_number: string
}

export type PhoneSendCodeEnvelopeDto = ApiEnvelope<{
  request_type: PhoneAuthRequestType
  security: string
  /** Présent uniquement quand l’envoi SMS est désactivé côté serveur. */
  otp_code?: string
}>

/** POST /auth/phone/verify-code */
export interface PhoneVerifyCodeBodyDto {
  security: string
  code: string
  first_name?: string
  last_name?: string
}

export type PhoneVerifyCodeEnvelopeDto = ApiEnvelope<{
  access_token: string
  refresh_token?: string | null
  user?: AuthUserDto | null
  request_type: PhoneAuthRequestType
  is_new_account: boolean
}>

/** POST /auth/refresh et /auth/logout */
export interface RefreshBodyDto {
  refresh_token: string
}

export type RefreshEnvelopeDto = ApiEnvelope<{
  access_token: string
  refresh_token: string
}>
