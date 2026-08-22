export type EraId =
  | 'medieval'
  | 'renaissance'
  | 'baroque'
  | 'classical'
  | 'romantic'
  | 'modern'
  | 'contemporary'

export interface EraBand {
  id: EraId
  name: string
  startYear: number
  endYear: number
}

export interface Composer {
  id: string
  name: string
  era: EraId
  // Absent from the real backend's composer list — a work's region is per-case, not per-composer.
  // Only the mock client (whose composers are fixed to one home city) sets this.
  regionId?: string
}

export interface Region {
  id: string
  name: string
}

export interface InstrumentationCategory {
  id: string
  name: string
}

// One of contemporary-account, letter, criticism, biographical, place, relationship,
// musical-characteristic, historical-event, anecdote — but treat unknown values as generic text
// rather than erroring, per API_CONTRACT.md.
export type ClueType = string

export interface Clue {
  id: string
  order: number
  type: ClueType
  label: string
  text: string
  attribution?: string
}

export interface Round {
  roundId: string
  caseNumber: number
  imageUrl: string
  clues: Clue[]
}

export interface MapPoint {
  x: number
  y: number
}

// A pin dropped on the Europe map (continuous, scored by distance like GeoGuessr), or an explicit
// admission the answer lies outside the pictured map. Absent entirely when the question is skipped.
export type RegionGuess = { type: 'map'; x: number; y: number } | { type: 'outside-europe' }

// null on any field means the player skipped that question honestly rather than guessing blind —
// scored with a flat honesty bonus instead of 0 (see mockClient.ts). cluesRevealed feeds the
// evidence-usage cost (see RoundResult.evidencePenalty).
export interface GuessPayload {
  instrumentationId: string | null
  guessedYear: number | null
  composerId: string | null
  regionGuess: RegionGuess | null
  cluesRevealed: number
}

export interface ScoreEntry {
  points: number
  maxPoints: number
  correct: boolean
  skipped: boolean
  yearsOff?: number
  mapDistance?: number
}

export interface ExplanationPoint {
  clueId: string | null
  text: string
}

export interface RoundResult {
  correct: {
    composerId: string
    composerName: string
    workTitle: string
    era: EraId
    yearComposed: number
    regionId: string
    instrumentationId: string
    // Where the answer sits on the map, in EuropeMap's coordinate space — each ApiClient
    // implementation computes this itself (mock via a fixed lookup, the real client by
    // projecting the backend's country lat/lon), so the reveal screen never has to know which.
    answerPoint: MapPoint | null
  }
  scoreBreakdown: {
    composer: ScoreEntry
    era: ScoreEntry
    region: ScoreEntry
    instrumentation: ScoreEntry
  }
  roundScore: number
  maxRoundScore: number
  evidencePenalty: number
  explanation: {
    summary: string
    points: ExplanationPoint[]
  }
}

export interface GameSession {
  sessionId: string
  rounds: Round[]
}

export interface RoundSummary {
  roundId: string
  roundScore: number
  maxRoundScore: number
}

export interface GameSummary {
  sessionId: string
  totalScore: number
  maxScore: number
  rounds: RoundSummary[]
}
