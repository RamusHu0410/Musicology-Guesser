import { EuropeMap } from '../../components/EuropeMap'
import { OrnamentDivider } from '../../components/OrnamentDivider'
import { ScoreBar } from '../../components/ScoreBar'
import { useGameStore } from '../../store/gameStore'
import { useReferenceStore } from '../../store/referenceStore'

export function RevealOverlay() {
  const currentResult = useGameStore((s) => s.currentResult)
  const lastGuess = useGameStore((s) => s.lastGuess)
  const nextRound = useGameStore((s) => s.nextRound)
  const currentRoundIndex = useGameStore((s) => s.currentRoundIndex)
  const currentRound = useGameStore((s) => s.rounds[s.currentRoundIndex])
  const totalRounds = useGameStore((s) => s.rounds.length)
  const regions = useReferenceStore((s) => s.regions)
  const instrumentationCategories = useReferenceStore((s) => s.instrumentationCategories)

  if (!currentResult) return null

  const regionName = regions.find((r) => r.id === currentResult.correct.regionId)?.name ?? '—'
  const instrumentationName =
    instrumentationCategories.find((c) => c.id === currentResult.correct.instrumentationId)?.name ?? '—'
  const isLastRound = currentRoundIndex >= totalRounds - 1
  const answerPoint = currentResult.correct.answerPoint
  const guessPoint = lastGuess?.regionGuess?.type === 'map' ? lastGuess.regionGuess : null

  const clueLabelFor = (clueId: string | null) => {
    if (!clueId) return 'The manuscript'
    const clue = currentRound?.clues.find((c) => c.id === clueId)
    return clue ? `Evidence ${clue.order}: ${clue.label}` : 'Evidence'
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/80 p-4">
      <div className="marble-panel flex max-h-[92vh] w-full max-w-md flex-col rounded-sm border border-gold/50">
        <div className="overflow-y-auto p-5">
          <h2 className="mb-1 text-2xl font-semibold text-ivory">{currentResult.correct.composerName}</h2>
          <p className="mb-1 text-base italic text-gold-soft">{currentResult.correct.workTitle}</p>
          <p className="mb-3 text-sm text-muted">
            {currentResult.correct.yearComposed} · {regionName} · {instrumentationName}
          </p>
          <div className="flex flex-col gap-2">
            <ScoreBar
              label="Instrumentation"
              points={currentResult.scoreBreakdown.instrumentation.points}
              maxPoints={currentResult.scoreBreakdown.instrumentation.maxPoints}
              correct={currentResult.scoreBreakdown.instrumentation.correct}
              skipped={currentResult.scoreBreakdown.instrumentation.skipped}
            />
            <ScoreBar
              label="Era / Year"
              points={currentResult.scoreBreakdown.era.points}
              maxPoints={currentResult.scoreBreakdown.era.maxPoints}
              correct={currentResult.scoreBreakdown.era.correct}
              skipped={currentResult.scoreBreakdown.era.skipped}
              detail={
                currentResult.scoreBreakdown.era.yearsOff !== undefined
                  ? `${currentResult.scoreBreakdown.era.yearsOff}y off`
                  : undefined
              }
            />
            <ScoreBar
              label="Composer"
              points={currentResult.scoreBreakdown.composer.points}
              maxPoints={currentResult.scoreBreakdown.composer.maxPoints}
              correct={currentResult.scoreBreakdown.composer.correct}
              skipped={currentResult.scoreBreakdown.composer.skipped}
            />
            <ScoreBar
              label="Region"
              points={currentResult.scoreBreakdown.region.points}
              maxPoints={currentResult.scoreBreakdown.region.maxPoints}
              correct={currentResult.scoreBreakdown.region.correct}
              skipped={currentResult.scoreBreakdown.region.skipped}
            />
          </div>

          {(guessPoint || answerPoint) && (
            <div className="mx-auto mt-3 w-48">
              <EuropeMap regions={regions} guessPoint={guessPoint} answerPoint={answerPoint} />
              {!answerPoint && <p className="mt-1 text-xs text-muted">The true answer lies outside this map.</p>}
            </div>
          )}

          {currentResult.evidencePenalty > 0 && (
            <p className="mt-3 text-sm text-muted">
              Evidence used: −{currentResult.evidencePenalty} pts
            </p>
          )}
          <p className="mt-2 text-right text-xl font-semibold text-gold">
            {currentResult.roundScore} / {currentResult.maxRoundScore}
          </p>
          <div className="mt-4 text-left">
            <OrnamentDivider />
            <p className="mt-3 mb-3 text-base text-ivory">{currentResult.explanation.summary}</p>
            <ul className="flex flex-col gap-2">
              {currentResult.explanation.points.map((point, index) => (
                <li key={index} className="text-sm text-muted">
                  <span className="font-medium text-gold-soft">{clueLabelFor(point.clueId)}: </span>
                  {point.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-gold/20 p-4">
          <button
            type="button"
            onClick={nextRound}
            className="w-full rounded-sm bg-gold px-4 py-2.5 font-medium text-ink hover:bg-gold-soft"
          >
            {isLastRound ? 'See results' : 'Next round'}
          </button>
        </div>
      </div>
    </div>
  )
}
