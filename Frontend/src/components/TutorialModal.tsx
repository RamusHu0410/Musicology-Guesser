import { useState } from 'react'

interface TutorialModalProps {
  onClose: () => void
}

interface Slide {
  title: string
  body: string
}

const SLIDES: Slide[] = [
  {
    title: 'Every Case Is Real',
    body: "Real manuscripts, real composers, real music history — you're the detective piecing it together, one case at a time.",
  },
  {
    title: 'One Frame, Three Panels',
    body: 'Field Guide, Play, and Collection all share this frame. Use the large arrows on either side to switch between them.',
  },
  {
    title: 'Four Questions Per Case',
    body: 'Each round shows a manuscript excerpt and a case file of clues. Guess the instrumentation, era, composer, and region — in that order.',
  },
  {
    title: 'Evidence Costs Points',
    body: 'Stuck on a question? Reveal a clue from the case file for −20 points, or skip the question outright for an honest 100.',
  },
  {
    title: 'The Region Question',
    body: "Drop a pin on the map for where you think the piece was written, or tap Outside Europe if that's your read.",
  },
  {
    title: 'Mid-Case Shortcuts',
    body: 'Tap Field Guide anytime for a beginner hint, or Quit to bail back to the menu without finishing the case.',
  },
  {
    title: 'Build Your Collection',
    body: "Every piece you play joins your Collection — gold for mastered, tan for improving, maroon for needs work.",
  },
]

export function TutorialModal({ onClose }: TutorialModalProps) {
  const [slideIndex, setSlideIndex] = useState(0)
  const isLast = slideIndex === SLIDES.length - 1
  const slide = SLIDES[slideIndex]

  function next() {
    if (isLast) {
      onClose()
    } else {
      setSlideIndex((i) => i + 1)
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 p-4">
      <div className="marble-panel flex w-full max-w-md flex-col gap-5 rounded-sm border border-gold/50 p-6">
        <div className="flex items-center justify-between border-b border-gold/20 pb-3">
          <h2 className="text-xl font-semibold text-ivory">How to Play</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close tutorial"
            className="rounded-sm border border-gold/30 px-2.5 py-1 text-sm text-muted hover:border-gold/60 hover:text-ivory"
          >
            ✕
          </button>
        </div>

        <div className="flex min-h-[9rem] flex-col gap-2 text-left">
          <p className="text-lg font-medium text-gold-soft">{slide.title}</p>
          <p className="text-muted">{slide.body}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {SLIDES.map((s, i) => (
              <span key={s.title} className={`h-1.5 w-1.5 rounded-full ${i === slideIndex ? 'bg-gold' : 'bg-gold/25'}`} />
            ))}
          </div>
          <div className="flex gap-2">
            {slideIndex > 0 && (
              <button
                type="button"
                onClick={() => setSlideIndex((i) => i - 1)}
                className="rounded-sm border border-gold/30 px-4 py-2 text-sm uppercase tracking-wide text-muted hover:border-gold/60 hover:text-ivory"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={next}
              className="rounded-sm bg-gold px-4 py-2 text-sm font-medium uppercase tracking-wide text-gold-pale transition-colors hover:bg-gold-pale hover:text-gold"
            >
              {isLast ? 'Got it' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
