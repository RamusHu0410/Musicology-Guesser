import { create } from 'zustand'
import { apiClient } from '../api'
import { useCollectionStore } from './collectionStore'
import type { GameSummary, GuessPayload, Round, RoundResult } from '../types/domain'

type GameStatus = 'idle' | 'loading' | 'playing' | 'revealing' | 'summary' | 'error'

interface GameState {
  status: GameStatus
  sessionId: string | null
  rounds: Round[]
  currentRoundIndex: number
  currentResult: RoundResult | null
  lastGuess: GuessPayload | null
  roundResults: RoundResult[]
  summary: GameSummary | null
  error: string | null
  startGame: (roundCount: number) => Promise<void>
  submitGuess: (guess: GuessPayload) => Promise<void>
  nextRound: () => void
  reset: () => void
}

const initialState = {
  status: 'idle' as GameStatus,
  sessionId: null as string | null,
  rounds: [] as Round[],
  currentRoundIndex: 0,
  currentResult: null as RoundResult | null,
  lastGuess: null as GuessPayload | null,
  roundResults: [] as RoundResult[],
  summary: null as GameSummary | null,
  error: null as string | null,
}

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,
  async startGame(roundCount) {
    set({ status: 'loading', error: null })
    try {
      const session = await apiClient.startGame(roundCount, 'normal')
      set({
        status: 'playing',
        sessionId: session.sessionId,
        rounds: session.rounds,
        currentRoundIndex: 0,
        roundResults: [],
        currentResult: null,
        summary: null,
      })
    } catch (err) {
      set({ status: 'error', error: (err as Error).message })
    }
  },
  async submitGuess(guess) {
    const { sessionId, rounds, currentRoundIndex } = get()
    const round = rounds[currentRoundIndex]
    if (!sessionId || !round) return
    try {
      const result = await apiClient.submitGuess(sessionId, round.roundId, guess)
      useCollectionStore.getState().recordPiece({
        caseNumber: round.caseNumber,
        composerId: result.correct.composerId,
        composerName: result.correct.composerName,
        workTitle: result.correct.workTitle,
        era: result.correct.era,
        yearComposed: result.correct.yearComposed,
        roundScore: result.roundScore,
        maxRoundScore: result.maxRoundScore,
      })
      set((state) => ({
        status: 'revealing',
        currentResult: result,
        lastGuess: guess,
        roundResults: [...state.roundResults, result],
      }))
    } catch (err) {
      set({ status: 'error', error: (err as Error).message })
    }
  },
  nextRound() {
    const { currentRoundIndex, rounds, sessionId } = get()
    const isLastRound = currentRoundIndex >= rounds.length - 1
    if (isLastRound) {
      if (sessionId) {
        apiClient.getSummary(sessionId).then((summary) => set({ status: 'summary', summary }))
      }
      return
    }
    set({ status: 'playing', currentRoundIndex: currentRoundIndex + 1, currentResult: null })
  },
  reset() {
    set(initialState)
  },
}))
