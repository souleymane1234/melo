import type { HttpClient } from '../../ports/http-client.port'
import { PROFILE_API_PATHS, type ProfileApiPaths } from './profile.paths'
import type { ProfileDto, ProfileEnvelopeDto, UpdateProfileDto } from './profile.types'

export interface ProfileApi {
  get(): Promise<ProfileDto>
  update(body: UpdateProfileDto): Promise<ProfileDto>
}

export function createProfileApi(
  http: HttpClient,
  paths: ProfileApiPaths = PROFILE_API_PATHS,
): ProfileApi {
  return {
    async get() {
      const res = await http.request<ProfileEnvelopeDto>({ method: 'GET', path: paths.me })
      return res.data
    },
    async update(body) {
      const res = await http.request<ProfileEnvelopeDto>({ method: 'PATCH', path: paths.me, body })
      return res.data
    },
  }
}
