import { COMPOSER_BIOS } from '../data/composerBios'
import { useCollectionStore } from '../store/collectionStore'
import type { Composer } from '../types/domain'
import { StarRating } from './StarRating'

interface ComposerDetailProps {
  composer: Composer
}

export function ComposerDetail({ composer }: ComposerDetailProps) {
  const pieces = useCollectionStore((s) => s.pieces)
  const bio = COMPOSER_BIOS[composer.id]
  const composerPieces = Object.values(pieces)
    .filter((piece) => piece.composerId === composer.id)
    .sort((a, b) => a.caseNumber - b.caseNumber)

  return (
    <div className="flex flex-col gap-4 text-left">
      {bio && (
        <div className="rounded-sm border border-gold/25 bg-ink-soft px-4 py-3">
          <p className="text-base text-muted">
            {bio.born}–{bio.died ?? 'present'} · {bio.fact}
          </p>
        </div>
      )}
      {composerPieces.length === 0 ? (
        <p className="text-base text-muted">No pieces practiced yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {composerPieces.map((piece) => (
            <li
              key={piece.caseNumber}
              className="flex items-center justify-between rounded-sm border border-gold/20 bg-ink-elevated px-4 py-3"
            >
              <div>
                <p className="text-base italic text-ivory">{piece.workTitle}</p>
                <p className="text-sm text-muted">
                  {piece.yearComposed} · ×{piece.timesPlayed}
                </p>
              </div>
              <StarRating score={piece.bestScore} maxScore={piece.maxScore} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
