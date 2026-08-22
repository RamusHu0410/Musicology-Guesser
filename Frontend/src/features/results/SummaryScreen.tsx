import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../../store/gameStore'

export function SummaryScreen() {
  const navigate = useNavigate()
  const summary = useGameStore((s) => s.summary)
  const reset = useGameStore((s) => s.reset)

  useEffect(() => {
    if (!summary) navigate('/', { replace: true })
  }, [summary, navigate])

  if (!summary) return null

  return (
    <main className="mx-auto flex max-w-lg flex-col items-center gap-6 p-6 pt-24 text-center">
      <h1 className="text-3xl font-semibold tracking-wide text-ivory">Final Score</h1>
      <p className="text-5xl font-bold text-gold">
        {summary.totalScore} <span className="text-2xl text-muted">/ {summary.maxScore}</span>
      </p>
      <div className="flex w-full flex-col gap-2">
        {summary.rounds.map((round, index) => (
          <div
            key={round.roundId}
            className="flex items-center justify-between rounded-sm border border-gold/25 bg-ink-elevated px-4 py-2 text-sm text-ivory"
          >
            <span>Round {index + 1}</span>
            <span>
              {round.roundScore} / {round.maxRoundScore}
            </span>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => {
          reset()
          navigate('/')
        }}
        className="rounded-sm bg-gold px-6 py-3 font-medium text-ink hover:bg-gold-soft"
      >
        Play again
      </button>
    </main>
  )
}
