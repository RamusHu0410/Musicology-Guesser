import { createMockApiClient } from './mockClient'

// Swap this for a real HTTP-backed ApiClient once the Java backend implements API_CONTRACT.md.
export const apiClient = createMockApiClient()

export type { ApiClient } from './client'
