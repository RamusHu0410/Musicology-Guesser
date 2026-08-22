import { create } from 'zustand'
import { apiClient } from '../api'
import type { Composer, InstrumentationCategory, Region } from '../types/domain'

interface ReferenceState {
  composers: Composer[]
  regions: Region[]
  instrumentationCategories: InstrumentationCategory[]
  loaded: boolean
  load: () => Promise<void>
}

export const useReferenceStore = create<ReferenceState>((set, get) => ({
  composers: [],
  regions: [],
  instrumentationCategories: [],
  loaded: false,
  async load() {
    if (get().loaded) return
    const [composers, regions, instrumentationCategories] = await Promise.all([
      apiClient.getComposers(),
      apiClient.getRegions(),
      apiClient.getInstrumentationCategories(),
    ])
    set({ composers, regions, instrumentationCategories, loaded: true })
  },
}))
