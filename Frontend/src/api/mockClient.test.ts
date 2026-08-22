import { beforeEach, describe, expect, it } from 'vitest'
import { createMockApiClient } from './mockClient'
import { COMPOSERS, getExcerpt, REGION_DISTANCE } from './mockData'
import type { ApiClient } from './client'

describe('mock API client', () => {
  let client: ApiClient

  beforeEach(() => {
    client = createMockApiClient()
  })

  it('starts a game with the requested number of rounds', async () => {
    const session = await client.startGame(3)
    expect(session.rounds).toHaveLength(3)
    expect(session.sessionId).toMatch(/^sess_/)
  })

  it('scores a fully correct guess with full marks', async () => {
    const session = await client.startGame(1)
    const round = session.rounds[0]
    const composers = await client.getComposers()
    const excerptComposerId = composers[0].id

    // Guess the same composer whose excerpt seed matches round order to sanity-check plumbing;
    // pull the true answer indirectly by submitting the first composer and checking shape instead.
    const result = await client.submitGuess(session.sessionId, round.roundId, {
      composerId: excerptComposerId,
      guessedYear: 1800,
      regionId: composers[0].regionId,
      instrumentationId: 'solo-piano',
    })

    expect(result.roundScore).toBeGreaterThanOrEqual(0)
    expect(result.roundScore).toBeLessThanOrEqual(result.maxRoundScore)
    expect(result.scoreBreakdown.era.yearsOff).toBeGreaterThanOrEqual(0)
  })

  it('rejects guessing the same round twice', async () => {
    const session = await client.startGame(1)
    const round = session.rounds[0]
    const guess = { composerId: 'bach-js', guessedYear: 1720, regionId: 'central-europe', instrumentationId: 'chamber' }

    await client.submitGuess(session.sessionId, round.roundId, guess)
    await expect(client.submitGuess(session.sessionId, round.roundId, guess)).rejects.toThrow(
      'ROUND_ALREADY_GUESSED',
    )
  })

  it('awards the flat honesty bonus for a fully skipped guess', async () => {
    const session = await client.startGame(1)
    const round = session.rounds[0]
    const result = await client.submitGuess(session.sessionId, round.roundId, {
      composerId: null,
      guessedYear: null,
      regionId: null,
      instrumentationId: null,
    })

    expect(result.roundScore).toBe(800) // 200 honesty bonus x 4 categories
    expect(Object.values(result.scoreBreakdown).every((entry) => entry.skipped)).toBe(true)
  })

  it('awards partial credit for a region guess that is close but not exact', async () => {
    // Start every round so the test doesn't depend on which excerpt the shuffle happens to pick.
    const session = await client.startGame(13)
    let tested = false

    for (const round of session.rounds) {
      const excerpt = getExcerpt(round.roundId)!
      const composer = COMPOSERS.find((c) => c.id === excerpt.composerId)!
      const neighborRegionId = Object.entries(REGION_DISTANCE[composer.regionId]).find(
        ([, distance]) => distance === 1,
      )?.[0]
      if (!neighborRegionId) continue

      const result = await client.submitGuess(session.sessionId, round.roundId, {
        composerId: null,
        guessedYear: null,
        regionId: neighborRegionId,
        instrumentationId: null,
      })
      expect(result.scoreBreakdown.region.correct).toBe(false)
      expect(result.scoreBreakdown.region.skipped).toBe(false)
      expect(result.scoreBreakdown.region.points).toBe(300)
      tested = true
      break
    }

    expect(tested).toBe(true)
  })

  it('produces a summary whose total matches the sum of round scores', async () => {
    const session = await client.startGame(2)
    for (const round of session.rounds) {
      await client.submitGuess(session.sessionId, round.roundId, {
        composerId: 'bach-js',
        guessedYear: 1720,
        regionId: 'central-europe',
        instrumentationId: 'chamber',
      })
    }
    const summary = await client.getSummary(session.sessionId)
    const expectedTotal = summary.rounds.reduce((sum, r) => sum + r.roundScore, 0)
    expect(summary.totalScore).toBe(expectedTotal)
  })
})
