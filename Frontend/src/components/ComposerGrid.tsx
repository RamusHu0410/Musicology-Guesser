import { useCollectionStore, type PracticedPiece } from '../store/collectionStore'
import type { Composer } from '../types/domain'

interface ComposerGridProps {
  composers: Composer[]
  onSelect: (composerId: string) => void
}

interface MasteryTier {
  label: string
  border: string
  background: string
  text: string
}

function masteryTierFor(composerPieces: PracticedPiece[]): MasteryTier {
  if (composerPieces.length === 0) {
    return { label: 'Not practiced', border: 'border-gold/20', background: 'bg-ink-elevated', text: 'text-muted' }
  }
  const totalScore = composerPieces.reduce((sum, piece) => sum + piece.bestScore, 0)
  const totalMax = composerPieces.reduce((sum, piece) => sum + piece.maxScore, 0)
  const pct = totalMax === 0 ? 0 : totalScore / totalMax
  if (pct >= 0.8) return { label: 'Mastered', border: 'border-gold', background: 'bg-gold/20', text: 'text-gold' }
  if (pct >= 0.5) {
    return { label: 'Improving', border: 'border-gold-soft', background: 'bg-gold-soft/15', text: 'text-gold-soft' }
  }
  return { label: 'Needs work', border: 'border-maroon/60', background: 'bg-maroon/10', text: 'text-maroon' }
}

export function ComposerGrid({ composers, onSelect }: ComposerGridProps) {
  const pieces = useCollectionStore((s) => s.pieces)
  const allPieces = Object.values(pieces)

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {composers.map((composer) => {
        const composerPieces = allPieces.filter((piece) => piece.composerId === composer.id)
        const tier = masteryTierFor(composerPieces)
        return (
          <button
            key={composer.id}
            type="button"
            onClick={() => onSelect(composer.id)}
            className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-sm border p-2 text-center transition-colors hover:border-gold ${tier.border} ${tier.background}`}
          >
            <span className="text-sm font-medium text-gold-soft">{composer.name}</span>
            <span className={`text-[10px] uppercase tracking-wide ${tier.text}`}>
              {composerPieces.length === 0
                ? tier.label
                : `${tier.label} · ${composerPieces.length} piece${composerPieces.length === 1 ? '' : 's'}`}
            </span>
          </button>
        )
      })}
    </div>
  )
}
