import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../../store/gameStore'
import { useReferenceStore } from '../../store/referenceStore'

const ROUND_OPTIONS = [3, 5, 8]

export function StartScreen() {
  const navigate = useNavigate()
  const [roundCount, setRoundCount] = useState(5)
  const startGame = useGameStore((s) => s.startGame)
  const status = useGameStore((s) => s.status)
  const load = useReferenceStore((s) => s.load)

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (status === 'playing') navigate('/play')
  }, [status, navigate])

  return (
    <main className="mx-auto flex max-w-lg flex-col items-center gap-6 p-6 pt-24 text-center">
      <h1 className="text-5xl font-semibold tracking-wide text-ivory">Musicology Guesser</h1>
      <p className="text-muted">
        You'll see a short excerpt of manuscript and a case file of evidence. Decide the instrumentation, era,
        composer, and region — skip anything you're unsure of for a modest, honest 200 points.
      </p>
      <div className="flex gap-2">
        {ROUND_OPTIONS.map((count) => (
          <button
            key={count}
            type="button"
            onClick={() => setRoundCount(count)}
            className={`rounded-sm border px-4 py-2 text-sm uppercase tracking-wide ${
              roundCount === count ? 'border-gold bg-gold/20 text-gold-soft' : 'border-gold/25 text-muted hover:border-gold/60'
            }`}
          >
            {count} rounds
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={status === 'loading'}
        onClick={() => startGame(roundCount)}
        className="rounded-sm bg-gold px-6 py-3 font-medium text-ink hover:bg-gold-soft disabled:opacity-60"
      >
        {status === 'loading' ? 'Loading…' : 'Play'}
      </button>
    </main>
  )
}
