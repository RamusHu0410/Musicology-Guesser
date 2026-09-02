import { createHttpApiClient, DEFAULT_API_BASE_URL } from './httpClient'

// Set VITE_API_BASE_URL to point at a different backend; defaults to the local dev server.
// VITE_API_URL is accepted as an alias because that is the name the Render service was created
// with, and a mismatch silently falls back to localhost in a production build.
export const apiClient = createHttpApiClient(
  import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? DEFAULT_API_BASE_URL,
)

export type { ApiClient } from './client'
