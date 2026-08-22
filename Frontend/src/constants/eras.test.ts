import { describe, expect, it } from 'vitest'
import { eraForYear } from './eras'

describe('eraForYear', () => {
  it('maps a year to its era band', () => {
    expect(eraForYear(1720).id).toBe('baroque')
    expect(eraForYear(1800).id).toBe('classical')
    expect(eraForYear(1850).id).toBe('romantic')
  })

  it('falls back to the last band for years beyond the timeline', () => {
    expect(eraForYear(2100).id).toBe('contemporary')
  })
})
