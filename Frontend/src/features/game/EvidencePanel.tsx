import { EvidenceCard } from '../../components/EvidenceCard'
import type { Clue } from '../../types/domain'

interface EvidencePanelProps {
  clues: Clue[]
  revealedCount: number
  onReveal: () => void
}

export function EvidencePanel({ clues, revealedCount, onReveal }: EvidencePanelProps) {
  const revealed = clues.slice(0, revealedCount)
  const hasMore = revealedCount < clues.length

  return (
    <div className="marble-panel flex flex-col gap-3 rounded-sm border border-gold/40 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg uppercase tracking-wide text-gold">Evidence</h2>
        {hasMore && (
          <button
            type="button"
            onClick={onReveal}
            className="rounded-sm border border-gold/30 px-3 py-1.5 text-sm text-ivory hover:border-gold/60"
          >
            Use evidence — take a clue (−100 pts) ({revealedCount}/{clues.length})
          </button>
        )}
      </div>
      {revealed.length === 0 ? (
        <p className="text-sm text-muted">No evidence used yet — using a clue costs 100 points off the round.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {revealed.map((clue) => (
            <EvidenceCard key={clue.id} clue={clue} />
          ))}
        </div>
      )}
    </div>
  )
}
