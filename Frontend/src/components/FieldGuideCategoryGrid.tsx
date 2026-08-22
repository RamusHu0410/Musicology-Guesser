import { FIELD_GUIDE_CATEGORIES, type FieldGuideCategory } from '../constants/fieldGuideCategories'

interface FieldGuideCategoryGridProps {
  onSelect: (category: FieldGuideCategory) => void
}

export function FieldGuideCategoryGrid({ onSelect }: FieldGuideCategoryGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {FIELD_GUIDE_CATEGORIES.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onSelect(category.id)}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-sm border border-gold/25 bg-ink-elevated p-3 text-center transition-colors hover:border-gold hover:bg-gold/10"
        >
          <span className="text-lg font-medium text-gold-soft">{category.label}</span>
          <span className="text-xs uppercase tracking-wide text-muted">{category.blurb}</span>
        </button>
      ))}
    </div>
  )
}
