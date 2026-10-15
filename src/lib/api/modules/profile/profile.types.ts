export interface ProfileSocialLinkDto {
  platform: string
  url: string
  logoUrl?: string | null
}

/** Corps PUT /api/v1/profile/user */
export interface UpdateStudentProfileDto {
  firstName?: string
  lastName?: string
  phoneNumber?: string
  bio?: string
  videoPresentationUrl?: string
  dateOfBirth?: string
  gender?: string
  nationality?: string
  address?: string
  city?: string
  country?: string
  profileImage?: string
  coverImage?: string
  interests?: string[]
  socialLinks?: ProfileSocialLinkDto[]
  academicLevel?: string
}

/** Réponse GET/PUT /api/v1/profile/user */
export interface StudentProfileResponseDto {
  id: string
  firstName?: string | null
  lastName?: string | null
  phoneNumber?: string | null
  bio?: string | null
  videoPresentationUrl?: string | null
  dateOfBirth?: string | null
  gender?: string | null
  nationality?: string | null
  address?: string | null
  city?: string | null
  country?: string | null
  profileImage?: string | null
  coverImage?: string | null
  interests: string[]
  socialLinks?: ProfileSocialLinkDto[] | null
  academicLevel?: string | null
  hasForeignFile: boolean
  hasScholarshipFile: boolean
  createdAt: string
  updatedAt: string
}

/** Certaines routes renvoient encore une enveloppe `{ success, data }`. */
export type StudentProfileEnvelopeDto =
  | StudentProfileResponseDto
  | {
      success: boolean
      message?: string
      data: StudentProfileResponseDto
    }

export function unwrapStudentProfile(
  response: StudentProfileEnvelopeDto,
): StudentProfileResponseDto {
  if (response && typeof response === 'object' && 'data' in response && response.data) {
    return response.data
  }
  return response as StudentProfileResponseDto
}
