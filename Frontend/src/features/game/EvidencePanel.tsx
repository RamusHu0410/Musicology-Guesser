import { useState } from 'react'
import { EvidenceCard } from '../../components/EvidenceCard'
import type { Clue } from '../../types/domain'

interface EvidencePanelProps {
  caseNumber: number
  clues: Clue[]
}

export function EvidencePanel({ caseNumber, clues }: EvidencePanelProps) {
  const [revealedCount, setRevealedCount] = useState(0)
  const revealed = clues.slice(0, revealedCount)
  const hasMore = revealedCount < clues.length

  return (
    <div className="marble-panel flex flex-col gap-3 rounded-sm border border-gold/40 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm uppercase tracking-wide text-gold">
          Case #{String(caseNumber).padStart(3, '0')} · Evidence
        </h2>
        {hasMore && (
          <button
            type="button"
            onClick={() => setRevealedCount((count) => count + 1)}
            className="rounded-sm border border-gold/30 px-3 py-1 text-xs text-ivory hover:border-gold/60"
          >
            Reveal next clue ({revealedCount}/{clues.length})
          </button>
        )}
      </div>
      {revealed.length === 0 ? (
        <p className="text-sm text-muted">No evidence revealed yet — reveal a clue to help narrow it down.</p>
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
