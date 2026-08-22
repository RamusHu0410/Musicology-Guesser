import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PracticedPiece {
  caseNumber: number
  composerId: string
  composerName: string
  workTitle: string
  era: string
  yearComposed: number
  timesPlayed: number
  bestScore: number
  maxScore: number
}

interface RecordPieceInput {
  caseNumber: number
  composerId: string
  composerName: string
  workTitle: string
  era: string
  yearComposed: number
  roundScore: number
  maxRoundScore: number
}

interface CollectionState {
  pieces: Record<number, PracticedPiece>
  recordPiece: (entry: RecordPieceInput) => void
}

// Persisted to localStorage so "pieces you've practiced" survives across sessions, not just games.
export const useCollectionStore = create<CollectionState>()(
  persist(
    (set) => ({
      pieces: {},
      recordPiece(entry) {
        set((state) => {
          const existing = state.pieces[entry.caseNumber]
          return {
            pieces: {
              ...state.pieces,
              [entry.caseNumber]: {
                caseNumber: entry.caseNumber,
                composerId: entry.composerId,
                composerName: entry.composerName,
                workTitle: entry.workTitle,
                era: entry.era,
                yearComposed: entry.yearComposed,
                timesPlayed: (existing?.timesPlayed ?? 0) + 1,
                bestScore: Math.max(existing?.bestScore ?? 0, entry.roundScore),
                maxScore: entry.maxRoundScore,
              },
            },
          }
        })
      },
    }),
    { name: 'musicology-guesser-collection' },
  ),
)
