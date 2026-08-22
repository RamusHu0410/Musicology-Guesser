import { ERA_BANDS } from '../constants/eras'
import type { FieldGuideCategory } from '../constants/fieldGuideCategories'
import { COMPOSER_HINTS, ERA_HINTS, INSTRUMENTATION_HINTS, REGION_HINTS } from '../data/wikiHints'
import { useReferenceStore } from '../store/referenceStore'

interface FieldGuideCategoryDetailProps {
  category: FieldGuideCategory
}

export function FieldGuideCategoryDetail({ category }: FieldGuideCategoryDetailProps) {
  const composers = useReferenceStore((s) => s.composers)
  const regions = useReferenceStore((s) => s.regions)
  const instrumentationCategories = useReferenceStore((s) => s.instrumentationCategories)

  const rows: { name: string; hint: string }[] =
    category === 'era'
      ? ERA_BANDS.map((band) => ({ name: band.name, hint: ERA_HINTS[band.id] }))
      : category === 'composer'
        ? composers.map((c) => ({ name: c.name, hint: COMPOSER_HINTS[c.id] ?? 'A composer worth getting to know.' }))
        : category === 'region'
          ? regions.map((r) => ({ name: r.name, hint: REGION_HINTS[r.id] ?? 'A place on the map.' }))
          : instrumentationCategories.map((c) => ({
              name: c.name,
              hint: INSTRUMENTATION_HINTS[c.id] ?? 'A way of making sound.',
            }))

  return (
    <div className="text-left">
      {rows.length === 0 ? (
        <p className="text-base text-muted">Loading…</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((row) => (
            <li key={row.name} className="rounded-sm border border-gold/20 bg-ink-soft px-4 py-3">
              <p className="text-lg font-medium text-gold-soft">{row.name}</p>
              <p className="text-base text-muted">{row.hint}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
