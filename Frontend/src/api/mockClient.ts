import { COMPOSER_MAP_POINTS, COMPOSERS, EXCERPTS, getExcerpt, INSTRUMENTATION_CATEGORIES, REGIONS } from './mockData'
import { generatePlaceholderScoreImage } from './placeholderScore'
import type { ApiClient } from './client'
import type { Composer, GuessPayload, RegionGuess, RoundResult, ScoreEntry } from '../types/domain'

const NETWORK_DELAY_MS = 250

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), NETWORK_DELAY_MS))
}

const COMPOSER_POINTS = 500
const REGION_POINTS = 500
const INSTRUMENTATION_POINTS = 500
const ERA_MAX_POINTS = 500
// Full points within a small grace window, decaying linearly to 0 by 100 years off.
const ERA_GRACE_YEARS = 5
const ERA_MAX_YEARS_OFF = 100

// Full points for a pin within this many map units of the real spot, decaying linearly to 0 by
// REGION_MAX_DISTANCE — mirrors GeoGuessr's distance-based round scoring.
const REGION_GRACE_DISTANCE = 15
const REGION_MAX_DISTANCE = 260

// Skipping a question honestly (rather than guessing blind) always earns this flat bonus,
// regardless of category — better than a wrong guess, worse than a right one.
const HONESTY_BONUS_POINTS = 100

// Revealing a clue costs points off the round — evidence is a paid hint, not a freebie.
const EVIDENCE_COST_POINTS = 20

function scoreExactMatch(guessValue: string | null, correctValue: string, maxPoints: number): ScoreEntry {
  if (guessValue === null) {
    return { points: HONESTY_BONUS_POINTS, maxPoints, correct: false, skipped: true }
  }
  const correct = guessValue === correctValue
  return { points: correct ? maxPoints : 0, maxPoints, correct, skipped: false }
}

function scoreEra(guessedYear: number | null, actualYear: number): ScoreEntry {
  if (guessedYear === null) {
    return { points: HONESTY_BONUS_POINTS, maxPoints: ERA_MAX_POINTS, correct: false, skipped: true }
  }
  const yearsOff = Math.abs(guessedYear - actualYear)
  const points =
    yearsOff <= ERA_GRACE_YEARS
      ? ERA_MAX_POINTS
      : Math.round(
          ERA_MAX_POINTS * Math.max(0, 1 - (yearsOff - ERA_GRACE_YEARS) / (ERA_MAX_YEARS_OFF - ERA_GRACE_YEARS)),
        )
  return { points, maxPoints: ERA_MAX_POINTS, correct: points === ERA_MAX_POINTS, skipped: false, yearsOff }
}

function scoreRegion(guess: RegionGuess | null, composer: Composer): ScoreEntry {
  if (guess === null) {
    return { points: HONESTY_BONUS_POINTS, maxPoints: REGION_POINTS, correct: false, skipped: true }
  }
  if (guess.type === 'outside-europe') {
    const correct = composer.regionId === 'north-america'
    return { points: correct ? REGION_POINTS : 0, maxPoints: REGION_POINTS, correct, skipped: false }
  }
  const truePoint = COMPOSER_MAP_POINTS[composer.id]
  if (!truePoint) {
    // Actual answer isn't pictured on this map at all — a map click can't be "close".
    return { points: 0, maxPoints: REGION_POINTS, correct: false, skipped: false }
  }
  const mapDistance = Math.hypot(guess.x - truePoint.x, guess.y - truePoint.y)
  const points =
    mapDistance <= REGION_GRACE_DISTANCE
      ? REGION_POINTS
      : Math.round(
          REGION_POINTS *
            Math.max(0, 1 - (mapDistance - REGION_GRACE_DISTANCE) / (REGION_MAX_DISTANCE - REGION_GRACE_DISTANCE)),
        )
  return { points, maxPoints: REGION_POINTS, correct: points === REGION_POINTS, skipped: false, mapDistance }
}

interface SessionState {
  roundIds: string[]
  results: Record<string, RoundResult>
}

export function createMockApiClient(): ApiClient {
  const sessions = new Map<string, SessionState>()

  return {
    async getComposers() {
      return delay(COMPOSERS)
    },
    async getRegions() {
      return delay(REGIONS)
    },
    async getInstrumentationCategories() {
      return delay(INSTRUMENTATION_CATEGORIES)
    },
    async startGame(roundCount, _difficulty = 'normal') {
      const sessionId = `sess_${Math.random().toString(36).slice(2, 10)}`
      const shuffled = [...EXCERPTS].sort(() => Math.random() - 0.5).slice(0, roundCount)
      sessions.set(sessionId, { roundIds: shuffled.map((excerpt) => excerpt.roundId), results: {} })
      const rounds = shuffled.map((excerpt) => ({
        roundId: excerpt.roundId,
        caseNumber: excerpt.caseNumber,
        imageUrl: generatePlaceholderScoreImage(excerpt.seed),
        clues: excerpt.clues.map((clue, index) => ({
          id: `${excerpt.roundId}c${index + 1}`,
          order: index + 1,
          type: clue.type,
          label: clue.label,
          text: clue.text,
          attribution: clue.attribution,
        })),
      }))
      return delay({ sessionId, rounds })
    },
    async submitGuess(sessionId, roundId, guess: GuessPayload) {
      const session = sessions.get(sessionId)
      if (!session) throw new Error('SESSION_NOT_FOUND')
      const excerpt = getExcerpt(roundId)
      if (!excerpt) throw new Error('ROUND_NOT_FOUND')
      if (session.results[roundId]) throw new Error('ROUND_ALREADY_GUESSED')

      const composer = COMPOSERS.find((c) => c.id === excerpt.composerId)
      if (!composer) throw new Error('VALIDATION_ERROR')

      const composerScore = scoreExactMatch(guess.composerId, composer.id, COMPOSER_POINTS)
      const era = scoreEra(guess.guessedYear, excerpt.yearComposed)
      const region = scoreRegion(guess.regionGuess, composer)
      const instrumentation = scoreExactMatch(guess.instrumentationId, excerpt.instrumentationId, INSTRUMENTATION_POINTS)

      const rawRoundScore = composerScore.points + era.points + region.points + instrumentation.points
      const maxRoundScore = composerScore.maxPoints + era.maxPoints + region.maxPoints + instrumentation.maxPoints
      const evidencePenalty = Math.max(0, guess.cluesRevealed) * EVIDENCE_COST_POINTS
      const roundScore = Math.max(0, rawRoundScore - evidencePenalty)

      const result: RoundResult = {
        correct: {
          composerId: composer.id,
          composerName: composer.name,
          workTitle: excerpt.workTitle,
          era: composer.era,
          yearComposed: excerpt.yearComposed,
          regionId: composer.regionId ?? '',
          instrumentationId: excerpt.instrumentationId,
          answerPoint: COMPOSER_MAP_POINTS[composer.id] ?? null,
        },
        scoreBreakdown: { composer: composerScore, era, region, instrumentation },
        roundScore,
        maxRoundScore,
        evidencePenalty,
        explanation: {
          summary: excerpt.explanationSummary,
          points: [
            { clueId: null, text: excerpt.manuscriptExplanation },
            ...excerpt.clues.map((clue, index) => ({
              clueId: `${roundId}c${index + 1}`,
              text: clue.explanation,
            })),
          ],
        },
      }

      session.results[roundId] = result
      return delay(result)
    },
    async getSummary(sessionId) {
      const session = sessions.get(sessionId)
      if (!session) throw new Error('SESSION_NOT_FOUND')
      const rounds = session.roundIds.map((roundId) => {
        const result = session.results[roundId]
        return {
          roundId,
          roundScore: result?.roundScore ?? 0,
          maxRoundScore: result?.maxRoundScore ?? 0,
        }
      })
      return delay({
        sessionId,
        totalScore: rounds.reduce((sum, r) => sum + r.roundScore, 0),
        maxScore: rounds.reduce((sum, r) => sum + r.maxRoundScore, 0),
        rounds,
      })
    },
  }
}
