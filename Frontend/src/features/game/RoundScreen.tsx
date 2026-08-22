import { useEffect } from 'react'
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

  useEffect(() => {
    if (status === 'idle') navigate('/', { replace: true })
    if (status === 'summary') navigate('/summary', { replace: true })
  }, [status, navigate])

  const round = rounds[currentRoundIndex]
  if (!round) return null

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          Round {currentRoundIndex + 1} of {rounds.length}
        </span>
        <ScoreDisplay />
        <span>Case #{String(round.caseNumber).padStart(3, '0')}</span>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          <SheetMusicViewer imageUrl={round.imageUrl} />
          {round.clues.length > 0 && (
            <EvidencePanel key={round.roundId} caseNumber={round.caseNumber} clues={round.clues} />
          )}
        </div>
        <GuessPanel
          key={round.roundId}
          composers={composers}
          regions={regions}
          instrumentationCategories={instrumentationCategories}
          onSubmit={submitGuess}
          disabled={status !== 'playing'}
        />
      </div>
      {status === 'revealing' && <RevealOverlay />}
    </main>
  )
}
