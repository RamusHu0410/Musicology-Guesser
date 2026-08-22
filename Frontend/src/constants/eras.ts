import type { EraBand } from '../types/domain'

export const ERA_BANDS: EraBand[] = [
  { id: 'medieval', name: 'Medieval', startYear: 500, endYear: 1400 },
  { id: 'renaissance', name: 'Renaissance', startYear: 1400, endYear: 1600 },
  { id: 'baroque', name: 'Baroque', startYear: 1600, endYear: 1750 },
  { id: 'classical', name: 'Classical', startYear: 1750, endYear: 1820 },
  { id: 'romantic', name: 'Romantic', startYear: 1820, endYear: 1900 },
  { id: 'modern', name: 'Modern', startYear: 1900, endYear: 1975 },
  { id: 'contemporary', name: 'Contemporary', startYear: 1975, endYear: 2025 },
]

export const TIMELINE_MIN_YEAR = ERA_BANDS[0].startYear
export const TIMELINE_MAX_YEAR = ERA_BANDS[ERA_BANDS.length - 1].endYear

export function eraForYear(year: number): EraBand {
  return ERA_BANDS.find((band) => year >= band.startYear && year < band.endYear) ?? ERA_BANDS[ERA_BANDS.length - 1]
}
