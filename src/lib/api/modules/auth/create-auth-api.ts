import type { HttpClient } from '../../ports/http-client.port'
import { AUTH_API_PATHS, type AuthApiPaths } from './auth.paths'
import type {
  PhoneSendCodeBodyDto,
  PhoneSendCodeEnvelopeDto,
  PhoneVerifyCodeBodyDto,
  PhoneVerifyCodeEnvelopeDto,
  RefreshBodyDto,
  RefreshEnvelopeDto,
} from './auth.types'

export interface AuthApi {
  sendPhoneCode(body: PhoneSendCodeBodyDto): Promise<PhoneSendCodeEnvelopeDto>
  verifyPhoneCode(body: PhoneVerifyCodeBodyDto): Promise<PhoneVerifyCodeEnvelopeDto>
  refresh(body: RefreshBodyDto): Promise<RefreshEnvelopeDto>
  logout(body: RefreshBodyDto): Promise<unknown>
}

export function createAuthApi(
  http: HttpClient,
  paths: AuthApiPaths = AUTH_API_PATHS,
): AuthApi {
  return {
    sendPhoneCode(body) {
      return http.request<PhoneSendCodeEnvelopeDto>({
        method: 'POST',
        path: paths.phoneSendCode,
        body,
      })
    },
    verifyPhoneCode(body) {
      return http.request<PhoneVerifyCodeEnvelopeDto>({
        method: 'POST',
        path: paths.phoneVerifyCode,
        body,
      })
    },
    refresh(body) {
      return http.request<RefreshEnvelopeDto>({
        method: 'POST',
        path: paths.refresh,
        body,
      })
    },
    logout(body) {
      return http.request<unknown>({
        method: 'POST',
        path: paths.logout,
        body,
      })
    },
  }
}
