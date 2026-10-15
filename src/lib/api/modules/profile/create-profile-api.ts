import type { HttpClient } from '../../ports/http-client.port'
import { PROFILE_API_PATHS, type ProfileApiPaths } from './profile.paths'
import {
  unwrapStudentProfile,
  type StudentProfileEnvelopeDto,
  type StudentProfileResponseDto,
  type UpdateStudentProfileDto,
} from './profile.types'

export interface ProfileApi {
  get(): Promise<StudentProfileResponseDto>
  update(body: UpdateStudentProfileDto): Promise<StudentProfileResponseDto>
}

export function createProfileApi(
  http: HttpClient,
  paths: ProfileApiPaths = PROFILE_API_PATHS,
): ProfileApi {
  return {
    async get() {
      const res = await http.request<StudentProfileEnvelopeDto>({
        method: 'GET',
        path: paths.user,
      })
      return unwrapStudentProfile(res)
    },
    async update(body) {
      const res = await http.request<StudentProfileEnvelopeDto>({
        method: 'PUT',
        path: paths.user,
        body,
      })
      return unwrapStudentProfile(res)
    },
  }
}
