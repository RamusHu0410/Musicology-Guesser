import { useState } from 'react'
import { useReferenceStore } from '../store/referenceStore'
import { CollectionIcon } from './CollectionIcon'
import { ComposerDetail } from './ComposerDetail'
import { ComposerGrid } from './ComposerGrid'

interface CollectionModalProps {
  onClose: () => void
}

export function CollectionModal({ onClose }: CollectionModalProps) {
  const composers = useReferenceStore((s) => s.composers)
  const [selectedComposerId, setSelectedComposerId] = useState<string | null>(null)
  const sortedComposers = [...composers].sort((a, b) => a.name.localeCompare(b.name))
  const selectedComposer = sortedComposers.find((composer) => composer.id === selectedComposerId) ?? null

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 p-4">
      <div className="marble-panel flex max-h-[85vh] w-full max-w-3xl flex-col rounded-sm border border-gold/50 p-5">
        <div className="mb-4 flex items-center gap-3 border-b border-gold/20 pb-3">
          {selectedComposer && (
            <button
              type="button"
              onClick={() => setSelectedComposerId(null)}
              aria-label="Back to all composers"
              className="rounded-sm border border-gold/30 px-2.5 py-1 text-sm text-muted hover:border-gold/60 hover:text-ivory"
            >
              ← Back
            </button>
          )}
          <h2 className="flex flex-1 items-center gap-2 text-xl font-semibold text-ivory">
            <CollectionIcon className="h-6 w-6 text-gold-soft" />
            {selectedComposer ? selectedComposer.name : 'Collection'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close collection"
            className="rounded-sm border border-gold/30 px-2.5 py-1 text-sm text-muted hover:border-gold/60 hover:text-ivory"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto pr-1">
          {selectedComposer ? (
            <ComposerDetail composer={selectedComposer} />
          ) : (
            <ComposerGrid composers={sortedComposers} onSelect={setSelectedComposerId} />
          )}
        </div>
      </div>
    </div>
  )
}
