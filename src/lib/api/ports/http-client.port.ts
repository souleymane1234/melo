import type { HttpRequest } from '../types/http-request'

export interface HttpClient {
  request<TResponse>(input: HttpRequest): Promise<TResponse>
}
