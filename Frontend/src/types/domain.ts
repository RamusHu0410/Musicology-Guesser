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
  regionId: string
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

// null on any field means the player skipped that question honestly rather than guessing blind —
// scored with a flat honesty bonus instead of 0 (see mockClient.ts).
export interface GuessPayload {
  instrumentationId: string | null
  guessedYear: number | null
  composerId: string | null
  regionId: string | null
}

export interface ScoreEntry {
  points: number
  maxPoints: number
  correct: boolean
  skipped: boolean
  yearsOff?: number
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
  }
  scoreBreakdown: {
    composer: ScoreEntry
    era: ScoreEntry
    region: ScoreEntry
    instrumentation: ScoreEntry
  }
  roundScore: number
  maxRoundScore: number
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
