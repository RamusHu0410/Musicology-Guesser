export type FieldGuideCategory = 'instrumentation' | 'era' | 'composer' | 'region'

export const FIELD_GUIDE_CATEGORIES: { id: FieldGuideCategory; label: string; blurb: string }[] = [
  { id: 'instrumentation', label: 'Instrumentation', blurb: 'What is playing' },
  { id: 'era', label: 'Era', blurb: 'When it was written' },
  { id: 'composer', label: 'Composer', blurb: 'Who wrote it' },
  { id: 'region', label: 'Region', blurb: 'Where it comes from' },
]
