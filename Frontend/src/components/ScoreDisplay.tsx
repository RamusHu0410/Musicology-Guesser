import { useGameStore } from '../store/gameStore'

export function ScoreDisplay() {
  const roundResults = useGameStore((s) => s.roundResults)
  const totalScore = roundResults.reduce((sum, r) => sum + r.roundScore, 0)
  const maxScore = roundResults.reduce((sum, r) => sum + r.maxRoundScore, 0)

  return (
    <div className="rounded-sm border border-gold/40 bg-ink-elevated px-4 py-1.5 text-sm">
      <span className="text-muted">Score </span>
      <span className="font-semibold text-gold">{totalScore}</span>
      <span className="text-muted"> / {maxScore}</span>
    </div>
  )
}
