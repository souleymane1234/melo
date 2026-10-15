export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

export type QueryParamValue = string | number | boolean | null | undefined

export type QueryParams = Record<string, QueryParamValue>

export interface HttpRequest {
  method: HttpMethod
  path: string
  query?: QueryParams
  body?: unknown
  headers?: Record<string, string>
  signal?: AbortSignal
}
