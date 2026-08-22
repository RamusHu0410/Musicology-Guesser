import { useState } from 'react'
import { FIELD_GUIDE_CATEGORIES, type FieldGuideCategory } from '../constants/fieldGuideCategories'
import { BookIcon } from './BookIcon'
import { FieldGuideCategoryDetail } from './FieldGuideCategoryDetail'
import { FieldGuideCategoryGrid } from './FieldGuideCategoryGrid'

interface FieldGuideModalProps {
  onClose: () => void
}

// An overlay rather than a route: mid-round, navigating away would unmount RoundScreen and reset
// its evidence-reveal progress (local state, not store state).
export function FieldGuideModal({ onClose }: FieldGuideModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<FieldGuideCategory | null>(null)
  const categoryLabel = FIELD_GUIDE_CATEGORIES.find((c) => c.id === selectedCategory)?.label

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 p-4">
      <div className="marble-panel flex max-h-[85vh] w-full max-w-lg flex-col rounded-sm border border-gold/50 p-4">
        <div className="mb-3 flex items-center gap-3 border-b border-gold/20 pb-3">
          {selectedCategory && (
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              aria-label="Back to all categories"
              className="rounded-sm border border-gold/30 px-2.5 py-1 text-sm text-muted hover:border-gold/60 hover:text-ivory"
            >
              ← Back
            </button>
          )}
          <h2 className="flex flex-1 items-center gap-2 text-xl font-semibold text-ivory">
            <BookIcon className="h-6 w-6 text-gold-soft" />
            {categoryLabel ?? 'Field Guide'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close field guide"
            className="rounded-sm border border-gold/30 px-2.5 py-1 text-sm text-muted hover:border-gold/60 hover:text-ivory"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto pr-1">
          {selectedCategory ? (
            <FieldGuideCategoryDetail category={selectedCategory} />
          ) : (
            <FieldGuideCategoryGrid onSelect={setSelectedCategory} />
          )}
        </div>
      </div>
    </div>
  )
}
