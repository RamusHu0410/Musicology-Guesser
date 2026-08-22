import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookIcon } from '../../components/BookIcon'
import { FieldGuideModal } from '../../components/FieldGuideModal'
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
  const reset = useGameStore((s) => s.reset)
  const composers = useReferenceStore((s) => s.composers)
  const regions = useReferenceStore((s) => s.regions)
  const instrumentationCategories = useReferenceStore((s) => s.instrumentationCategories)

  const [revealState, setRevealState] = useState({ roundId: '', revealedCount: 0 })
  const [showFieldGuide, setShowFieldGuide] = useState(false)

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

  function quit() {
    if (window.confirm('Quit this game and lose your progress?')) {
      reset()
      navigate('/')
    }
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between text-base text-ivory">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={quit}
            className="rounded-sm border border-muted/40 px-3 py-1 text-sm uppercase tracking-wide text-muted hover:border-maroon hover:text-maroon"
          >
            Quit
          </button>
          <button
            type="button"
            onClick={() => setShowFieldGuide(true)}
            className="flex items-center gap-1.5 rounded-sm border border-gold/30 px-3 py-1 text-sm uppercase tracking-wide text-muted hover:border-gold/60 hover:text-ivory"
          >
            <BookIcon className="h-4 w-4" />
            Field Guide
          </button>
        </div>
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
      {showFieldGuide && <FieldGuideModal onClose={() => setShowFieldGuide(false)} />}
    </main>
  )
}
