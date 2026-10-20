import type { HttpClient } from '../../ports/http-client.port'
import type { CatalogDto, CatalogEnvelopeDto } from './catalog.types'

export const CATALOG_API_PATHS = {
  catalog: '/api/v1/catalog',
} as const

export interface CatalogApi {
  get(signal?: AbortSignal): Promise<CatalogDto>
}

export function createCatalogApi(http: HttpClient): CatalogApi {
  return {
    async get(signal) {
      const res = await http.request<CatalogEnvelopeDto>({
        method: 'GET',
        path: CATALOG_API_PATHS.catalog,
        signal,
      })
      return res.data
    },
  }
}
