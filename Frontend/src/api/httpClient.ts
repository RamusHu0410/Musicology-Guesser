import { projectLatLon } from './mockData'
import type { ApiClient } from './client'
import type {
  Composer,
  EraId,
  GameSession,
  GameSummary,
  GuessPayload,
  InstrumentationCategory,
  MapPoint,
  Region,
  RoundResult,
  ScoreEntry,
} from '../types/domain'

export const DEFAULT_API_BASE_URL = 'http://localhost:8080'

// The real backend has no skip/honesty-bonus or evidence-cost concept (every GuessRequest field
// is required, and it never sees how many clues were revealed). To keep those frontend mechanics
// without the backend's cooperation, this client substitutes a placeholder guess for any skipped
// axis before sending the request, then overwrites that axis's score with the honesty bonus
// locally — the backend's own (meaningless, placeholder-driven) score for that axis is discarded.
// Evidence cost never leaves the browser at all; it's subtracted from the displayed round score
// here, same as the mock. See the "adapt client-side" decision this mirrors.
const HONESTY_BONUS_POINTS = 100
const EVIDENCE_COST_POINTS = 20

interface CountryRef {
  id: string
  name: string
  lat: number
  lon: number
}

interface BackendAxisScore {
  points: number
  maxPoints: number
  correct: boolean
  yearsOff?: number
}

interface BackendGuessResponse {
  correct: {
    composerId: string
    composerName: string
    workTitle: string
    era: string
    yearComposed: number
    countryId: string
    countryName: string
    instrumentationId: string
  }
  scoreBreakdown: {
    composer: BackendAxisScore
    era: BackendAxisScore
    country: BackendAxisScore
    instrumentation: BackendAxisScore
  }
  explanation: {
    summary: string
    points: { clueId: string | null; text: string }[]
  }
}

function skipEntry(maxPoints: number): ScoreEntry {
  return { points: HONESTY_BONUS_POINTS, maxPoints, correct: false, skipped: true }
}

function realEntry(axis: BackendAxisScore): ScoreEntry {
  return { points: axis.points, maxPoints: axis.maxPoints, correct: axis.correct, skipped: false, yearsOff: axis.yearsOff }
}

export function createHttpApiClient(baseUrl: string = DEFAULT_API_BASE_URL): ApiClient {
  let countriesPromise: Promise<CountryRef[]> | null = null
  let composerIdsPromise: Promise<string[]> | null = null
  let instrumentationIdsPromise: Promise<string[]> | null = null
  const resultsBySession = new Map<string, Map<string, RoundResult>>()

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    })
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string; message?: string } | null
      throw new Error(body?.message ?? body?.error ?? `Request to ${path} failed with status ${res.status}`)
    }
    return res.json() as Promise<T>
  }

  function loadCountries(): Promise<CountryRef[]> {
    countriesPromise ??= request<CountryRef[]>('/api/countries')
    return countriesPromise
  }

  function loadComposerIds(): Promise<string[]> {
    composerIdsPromise ??= request<{ id: string }[]>('/api/composers').then((list) => list.map((c) => c.id))
    return composerIdsPromise
  }

  function loadInstrumentationIds(): Promise<string[]> {
    instrumentationIdsPromise ??= request<{ id: string }[]>('/api/instrumentation-categories').then((list) =>
      list.map((c) => c.id),
    )
    return instrumentationIdsPromise
  }

  // The map's click handler and the country lat/lon both go through the same projectLatLon, so
  // "closest projected country centroid to this pixel" is a sound stand-in for a real point-in-
  // country lookup, without needing precise country border geometry.
  function nearestCountryId(point: MapPoint, countries: CountryRef[]): string {
    let bestId = countries[0].id
    let bestDistance = Infinity
    for (const country of countries) {
      const projected = projectLatLon(country.lat, country.lon)
      const distance = Math.hypot(point.x - projected.x, point.y - projected.y)
      if (distance < bestDistance) {
        bestDistance = distance
        bestId = country.id
      }
    }
    return bestId
  }

  return {
    async getComposers(): Promise<Composer[]> {
      const list = await request<{ id: string; name: string; era: string }[]>('/api/composers')
      return list.map((c) => ({ id: c.id, name: c.name, era: c.era as EraId }))
    },

    async getRegions(): Promise<Region[]> {
      const countries = await loadCountries()
      return countries.map((c) => ({ id: c.id, name: c.name }))
    },

    async getInstrumentationCategories(): Promise<InstrumentationCategory[]> {
      return request<InstrumentationCategory[]>('/api/instrumentation-categories')
    },

    async startGame(roundCount, difficulty): Promise<GameSession> {
      return request<GameSession>('/api/game/start', {
        method: 'POST',
        body: JSON.stringify({ roundCount, difficulty }),
      })
    },

    async submitGuess(sessionId, roundId, guess: GuessPayload): Promise<RoundResult> {
      const [countries, composerIds, instrumentationIds] = await Promise.all([
        loadCountries(),
        loadComposerIds(),
        loadInstrumentationIds(),
      ])

      const composerSkipped = guess.composerId === null
      const eraSkipped = guess.guessedYear === null
      const instrumentationSkipped = guess.instrumentationId === null
      const regionSkipped = guess.regionGuess === null

      // "Outside Europe" has no backend equivalent (every real case sits in one of these
      // countries) — a placeholder country is sent and, correctly, just scores 0.
      const countryId =
        guess.regionGuess === null || guess.regionGuess.type === 'outside-europe'
          ? countries[0].id
          : nearestCountryId(guess.regionGuess, countries)

      const response = await request<BackendGuessResponse>(`/api/game/${sessionId}/rounds/${roundId}/guess`, {
        method: 'POST',
        body: JSON.stringify({
          composerId: guess.composerId ?? composerIds[0],
          guessedYear: guess.guessedYear ?? 1800,
          countryId,
          instrumentationId: guess.instrumentationId ?? instrumentationIds[0],
        }),
      })

      const composer = composerSkipped ? skipEntry(response.scoreBreakdown.composer.maxPoints) : realEntry(response.scoreBreakdown.composer)
      const era = eraSkipped ? skipEntry(response.scoreBreakdown.era.maxPoints) : realEntry(response.scoreBreakdown.era)
      const region = regionSkipped ? skipEntry(response.scoreBreakdown.country.maxPoints) : realEntry(response.scoreBreakdown.country)
      const instrumentation = instrumentationSkipped
        ? skipEntry(response.scoreBreakdown.instrumentation.maxPoints)
        : realEntry(response.scoreBreakdown.instrumentation)

      const rawRoundScore = composer.points + era.points + region.points + instrumentation.points
      const maxRoundScore = composer.maxPoints + era.maxPoints + region.maxPoints + instrumentation.maxPoints
      const evidencePenalty = Math.max(0, guess.cluesRevealed) * EVIDENCE_COST_POINTS
      const roundScore = Math.max(0, rawRoundScore - evidencePenalty)

      const answerCountry = countries.find((c) => c.id === response.correct.countryId)

      const result: RoundResult = {
        correct: {
          composerId: response.correct.composerId,
          composerName: response.correct.composerName,
          workTitle: response.correct.workTitle,
          era: response.correct.era as EraId,
          yearComposed: response.correct.yearComposed,
          regionId: response.correct.countryId,
          instrumentationId: response.correct.instrumentationId,
          answerPoint: answerCountry ? projectLatLon(answerCountry.lat, answerCountry.lon) : null,
        },
        scoreBreakdown: { composer, era, region, instrumentation },
        roundScore,
        maxRoundScore,
        evidencePenalty,
        explanation: response.explanation,
      }

      let sessionResults = resultsBySession.get(sessionId)
      if (!sessionResults) {
        sessionResults = new Map()
        resultsBySession.set(sessionId, sessionResults)
      }
      sessionResults.set(roundId, result)

      return result
    },

    // Recomputed from this client's own recorded results rather than trusting the backend's own
    // session total — the backend's total is derived from the placeholder guesses substituted for
    // skipped axes above, so it would silently disagree with what the player was actually shown.
    async getSummary(sessionId): Promise<GameSummary> {
      const results = resultsBySession.get(sessionId)
      const rounds = results
        ? [...results.entries()].map(([roundId, result]) => ({
            roundId,
            roundScore: result.roundScore,
            maxRoundScore: result.maxRoundScore,
          }))
        : []
      return {
        sessionId,
        totalScore: rounds.reduce((sum, r) => sum + r.roundScore, 0),
        maxScore: rounds.reduce((sum, r) => sum + r.maxRoundScore, 0),
        rounds,
      }
    },
  }
}
