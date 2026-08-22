import { useState } from 'react'
import { ChipSelect } from '../../components/ChipSelect'
import { ComposerSearch } from '../../components/ComposerSearch'
import { EraTimelineSlider } from '../../components/EraTimelineSlider'
import { EuropeMap } from '../../components/EuropeMap'
import { TIMELINE_MAX_YEAR, TIMELINE_MIN_YEAR } from '../../constants/eras'
import type { Composer, GuessPayload, InstrumentationCategory, Region } from '../../types/domain'

interface GuessPanelProps {
  composers: Composer[]
  regions: Region[]
  instrumentationCategories: InstrumentationCategory[]
  onSubmit: (guess: GuessPayload) => void
  disabled?: boolean
}

type StepKey = 'instrumentation' | 'era' | 'composer' | 'region'

// Instrumentation is asked first and in isolation; the rest come one at a time after it, in this
// order. Every question, including instrumentation, can be skipped for a flat honesty bonus.
const STEP_ORDER: StepKey[] = ['instrumentation', 'era', 'composer', 'region']

const STEP_TITLES: Record<StepKey, string> = {
  instrumentation: 'Instrumentation',
  era: 'Era / Year',
  composer: 'Composer',
  region: 'Region',
}

const DEFAULT_YEAR = Math.round((TIMELINE_MIN_YEAR + TIMELINE_MAX_YEAR) / 2)

interface Answers {
  instrumentationId: string | null
  guessedYear: number | null
  composerId: string | null
  regionId: string | null
}

export function GuessPanel({ composers, regions, instrumentationCategories, onSubmit, disabled }: GuessPanelProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<Answers>({
    instrumentationId: null,
    guessedYear: null,
    composerId: null,
    regionId: null,
  })
  const [draftYear, setDraftYear] = useState(DEFAULT_YEAR)

  const currentStep = STEP_ORDER[stepIndex]
  const isLastStep = stepIndex === STEP_ORDER.length - 1

  function commit(patch: Partial<Answers>) {
    const next = { ...answers, ...patch }
    setAnswers(next)
    if (isLastStep) {
      onSubmit(next)
    } else {
      setStepIndex((i) => i + 1)
    }
  }

  function skipCurrent() {
    switch (currentStep) {
      case 'instrumentation':
        commit({ instrumentationId: null })
        break
      case 'era':
        commit({ guessedYear: null })
        break
      case 'composer':
        commit({ composerId: null })
        break
      case 'region':
        commit({ regionId: null })
        break
    }
  }

  const answeredLabel = (step: StepKey): string => {
    switch (step) {
      case 'instrumentation':
        return answers.instrumentationId
          ? instrumentationCategories.find((c) => c.id === answers.instrumentationId)?.name ?? '—'
          : 'Skipped'
      case 'era':
        return answers.guessedYear !== null ? String(answers.guessedYear) : 'Skipped'
      case 'composer':
        return answers.composerId ? composers.find((c) => c.id === answers.composerId)?.name ?? '—' : 'Skipped'
      case 'region':
        return answers.regionId ? regions.find((r) => r.id === answers.regionId)?.name ?? '—' : 'Skipped'
    }
  }

  return (
    <div
      className={`marble-panel flex flex-col gap-5 rounded-sm border border-gold/40 p-5 ${
        disabled ? 'pointer-events-none opacity-60' : ''
      }`}
    >
      {stepIndex > 0 && (
        <ul className="flex flex-col gap-1 border-b border-gold/20 pb-3 text-xs text-muted">
          {STEP_ORDER.slice(0, stepIndex).map((step) => (
            <li key={step} className="flex justify-between">
              <span>{STEP_TITLES[step]}</span>
              <span className="text-ivory">{answeredLabel(step)}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted">
        <span>
          Question {stepIndex + 1} of {STEP_ORDER.length}
        </span>
        <span className="text-gold">{STEP_TITLES[currentStep]}</span>
      </div>

      {currentStep === 'instrumentation' && (
        <ChipSelect
          label="Instrumentation"
          options={instrumentationCategories}
          value={answers.instrumentationId}
          onChange={(id) => commit({ instrumentationId: id })}
        />
      )}

      {currentStep === 'era' && (
        <div className="flex flex-col gap-3">
          <EraTimelineSlider value={draftYear} onChange={setDraftYear} />
          <button
            type="button"
            onClick={() => commit({ guessedYear: draftYear })}
            className="rounded-sm bg-gold px-4 py-2 font-medium text-ink hover:bg-gold-soft"
          >
            Confirm year
          </button>
        </div>
      )}

      {currentStep === 'composer' && (
        <ComposerSearch composers={composers} value={answers.composerId} onChange={(id) => commit({ composerId: id })} />
      )}

      {currentStep === 'region' && (
        <EuropeMap regions={regions} value={answers.regionId} onChange={(id) => commit({ regionId: id })} />
      )}

      <button
        type="button"
        onClick={skipCurrent}
        className="self-start text-xs uppercase tracking-wide text-muted underline-offset-2 hover:text-gold hover:underline"
      >
        Skip — take 200 points for honesty
      </button>
    </div>
  )
}
