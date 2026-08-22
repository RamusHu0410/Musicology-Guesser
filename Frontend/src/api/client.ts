import type {
  Composer,
  GameSession,
  GameSummary,
  GuessPayload,
  InstrumentationCategory,
  Region,
  RoundResult,
} from '../types/domain'

export interface ApiClient {
  getComposers(): Promise<Composer[]>
  getRegions(): Promise<Region[]>
  getInstrumentationCategories(): Promise<InstrumentationCategory[]>
  startGame(roundCount: number, difficulty?: string): Promise<GameSession>
  submitGuess(sessionId: string, roundId: string, guess: GuessPayload): Promise<RoundResult>
  getSummary(sessionId: string): Promise<GameSummary>
}
