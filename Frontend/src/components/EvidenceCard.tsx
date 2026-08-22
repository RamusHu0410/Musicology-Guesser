import type { Clue } from '../types/domain'

const TYPE_LABELS: Record<string, string> = {
  'contemporary-account': 'Contemporary account',
  letter: 'Letter',
  criticism: 'Criticism',
  biographical: 'Biographical',
  place: 'Place',
  relationship: 'Relationship',
  'musical-characteristic': 'Musical characteristic',
  'historical-event': 'Historical event',
  anecdote: 'Anecdote',
}

interface EvidenceCardProps {
  clue: Clue
}

export function EvidenceCard({ clue }: EvidenceCardProps) {
  return (
    <div className="rounded-sm border border-gold/25 bg-ink p-3">
      <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-wide text-muted">
        <span>{TYPE_LABELS[clue.type] ?? 'Evidence'}</span>
        <span>#{clue.order}</span>
      </div>
      <p className="text-sm font-medium text-ivory">{clue.label}</p>
      <p className="mt-1 text-sm text-muted">{clue.text}</p>
      {clue.attribution && <p className="mt-1 text-xs italic text-muted">— {clue.attribution}</p>}
    </div>
  )
}
