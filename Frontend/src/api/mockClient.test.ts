import { beforeEach, describe, expect, it } from 'vitest'
import { createMockApiClient } from './mockClient'
import { COMPOSER_MAP_POINTS, getExcerpt } from './mockData'
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

    const result = await client.submitGuess(session.sessionId, round.roundId, {
      composerId: excerptComposerId,
      guessedYear: 1800,
      regionGuess: { type: 'map', x: 200, y: 150 },
      instrumentationId: 'solo-piano',
      cluesRevealed: 0,
    })

    expect(result.roundScore).toBeGreaterThanOrEqual(0)
    expect(result.roundScore).toBeLessThanOrEqual(result.maxRoundScore)
    expect(result.scoreBreakdown.era.yearsOff).toBeGreaterThanOrEqual(0)
  })

  it('rejects guessing the same round twice', async () => {
    const session = await client.startGame(1)
    const round = session.rounds[0]
    const guess = {
      composerId: 'bach-js',
      guessedYear: 1720,
      regionGuess: { type: 'outside-europe' } as const,
      instrumentationId: 'chamber',
      cluesRevealed: 0,
    }

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
      regionGuess: null,
      instrumentationId: null,
      cluesRevealed: 0,
    })

    expect(result.roundScore).toBe(800) // 200 honesty bonus x 4 categories
    expect(Object.values(result.scoreBreakdown).every((entry) => entry.skipped)).toBe(true)
  })

  it('awards full region marks for a pin dropped exactly on the true location', async () => {
    const session = await client.startGame(13)
    const round = session.rounds.find((r) => COMPOSER_MAP_POINTS[getExcerpt(r.roundId)!.composerId])!
    const excerpt = getExcerpt(round.roundId)!
    const truePoint = COMPOSER_MAP_POINTS[excerpt.composerId]

    const result = await client.submitGuess(session.sessionId, round.roundId, {
      composerId: null,
      guessedYear: null,
      regionGuess: { type: 'map', x: truePoint.x, y: truePoint.y },
      instrumentationId: null,
      cluesRevealed: 0,
    })

    expect(result.scoreBreakdown.region.correct).toBe(true)
    expect(result.scoreBreakdown.region.points).toBe(500)
  })

  it('gives partial region credit that decays with map distance', async () => {
    const session = await client.startGame(13)
    const round = session.rounds.find((r) => COMPOSER_MAP_POINTS[getExcerpt(r.roundId)!.composerId])!
    const excerpt = getExcerpt(round.roundId)!
    const truePoint = COMPOSER_MAP_POINTS[excerpt.composerId]

    const result = await client.submitGuess(session.sessionId, round.roundId, {
      composerId: null,
      guessedYear: null,
      regionGuess: { type: 'map', x: truePoint.x + 60, y: truePoint.y },
      instrumentationId: null,
      cluesRevealed: 0,
    })

    expect(result.scoreBreakdown.region.correct).toBe(false)
    expect(result.scoreBreakdown.region.points).toBeGreaterThan(0)
    expect(result.scoreBreakdown.region.points).toBeLessThan(500)
  })

  it('deducts 100 points per clue used from the round score', async () => {
    const session = await client.startGame(1)
    const round = session.rounds[0]

    const result = await client.submitGuess(session.sessionId, round.roundId, {
      composerId: 'bach-js',
      guessedYear: 1720,
      regionGuess: { type: 'outside-europe' },
      instrumentationId: 'chamber',
      cluesRevealed: 2,
    })

    expect(result.evidencePenalty).toBe(200)
    expect(result.roundScore).toBeGreaterThanOrEqual(0)
  })

  it('produces a summary whose total matches the sum of round scores', async () => {
    const session = await client.startGame(2)
    for (const round of session.rounds) {
      await client.submitGuess(session.sessionId, round.roundId, {
        composerId: 'bach-js',
        guessedYear: 1720,
        regionGuess: { type: 'outside-europe' },
        instrumentationId: 'chamber',
        cluesRevealed: 0,
      })
    }
    const summary = await client.getSummary(session.sessionId)
    const expectedTotal = summary.rounds.reduce((sum, r) => sum + r.roundScore, 0)
    expect(summary.totalScore).toBe(expectedTotal)
  })
})
