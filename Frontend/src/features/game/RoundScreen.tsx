import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScoreDisplay } from '../../components/ScoreDisplay'
import { SheetMusicViewer } from '../../components/SheetMusicViewer'
import { useGameStore } from '../../store/gameStore'
import { useReferenceStore } from '../../store/referenceStore'
import { EvidencePanel } from './EvidencePanel'
import { GuessPanel } from './GuessPanel'
import { RevealOverlay } from './RevealOverlay'

export function RoundScreen() {
  const navigate = useNavigate()
  const status = useGameStore((s) => s.status)
  const rounds = useGameStore((s) => s.rounds)
  const currentRoundIndex = useGameStore((s) => s.currentRoundIndex)
  const submitGuess = useGameStore((s) => s.submitGuess)
  const composers = useReferenceStore((s) => s.composers)
  const regions = useReferenceStore((s) => s.regions)
  const instrumentationCategories = useReferenceStore((s) => s.instrumentationCategories)

  const [revealState, setRevealState] = useState({ roundId: '', revealedCount: 0 })

  useEffect(() => {
    if (status === 'idle') navigate('/', { replace: true })
    if (status === 'summary') navigate('/summary', { replace: true })
  }, [status, navigate])

  const round = rounds[currentRoundIndex]

  // Reset the evidence count as soon as we render a new round, rather than in a follow-up effect.
  if (round && revealState.roundId !== round.roundId) {
    setRevealState({ roundId: round.roundId, revealedCount: 0 })
  }

  if (!round) return null

  const revealedCount = revealState.roundId === round.roundId ? revealState.revealedCount : 0

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between text-base text-ivory">
        <span>
          Round {currentRoundIndex + 1} of {rounds.length} · Case #{String(round.caseNumber).padStart(3, '0')}
        </span>
        <ScoreDisplay />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          <SheetMusicViewer imageUrl={round.imageUrl} />
          {round.clues.length > 0 && (
            <EvidencePanel
              key={round.roundId}
              clues={round.clues}
              revealedCount={revealedCount}
              onReveal={() => setRevealState({ roundId: round.roundId, revealedCount: revealedCount + 1 })}
            />
          )}
        </div>
        <GuessPanel
          key={round.roundId}
          composers={composers}
          regions={regions}
          instrumentationCategories={instrumentationCategories}
          onSubmit={(guess) => submitGuess({ ...guess, cluesRevealed: revealedCount })}
          disabled={status !== 'playing'}
        />
      </div>
      {status === 'revealing' && <RevealOverlay />}
    </main>
  )
}
