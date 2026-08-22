import { createHttpApiClient, DEFAULT_API_BASE_URL } from './httpClient'

// Set VITE_API_BASE_URL to point at a different backend; defaults to the local dev server.
export const apiClient = createHttpApiClient(import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL)

export type { ApiClient } from './client'
