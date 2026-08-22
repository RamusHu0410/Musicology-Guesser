import { useGameStore } from '../store/gameStore'

export function ScoreDisplay() {
  const roundResults = useGameStore((s) => s.roundResults)
  const totalScore = roundResults.reduce((sum, r) => sum + r.roundScore, 0)
  const maxScore = roundResults.reduce((sum, r) => sum + r.maxRoundScore, 0)

  return (
    <div className="flex items-baseline gap-2 rounded-sm border border-gold/40 bg-ink-elevated px-5 py-2">
      <span className="text-sm uppercase tracking-wide text-muted">Score</span>
      <span className="text-3xl font-semibold text-gold">{totalScore}</span>
      <span className="text-lg text-muted">/ {maxScore}</span>
    </div>
  )
}
