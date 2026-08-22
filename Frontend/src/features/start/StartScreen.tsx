import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookIcon } from '../../components/BookIcon'
import { CollectionIcon } from '../../components/CollectionIcon'
import { CollectionModal } from '../../components/CollectionModal'
import { FieldGuideModal } from '../../components/FieldGuideModal'
import { HelpIcon } from '../../components/HelpIcon'
import { OrnamentDivider } from '../../components/OrnamentDivider'
import { Triangle } from '../../components/Triangle'
import { TutorialModal } from '../../components/TutorialModal'
import { useGameStore } from '../../store/gameStore'
import { useReferenceStore } from '../../store/referenceStore'

const ROUND_OPTIONS = [3, 5, 8]
const TUTORIAL_SEEN_KEY = 'musicology-guesser-tutorial-seen'

const SECTIONS = [
  { id: 'guide', label: 'Field Guide' },
  { id: 'play', label: 'Play' },
  { id: 'collection', label: 'Collection' },
] as const

export function StartScreen() {
  const navigate = useNavigate()
  const [roundCount, setRoundCount] = useState(5)
  const [sectionIndex, setSectionIndex] = useState(1)
  const [showFieldGuideModal, setShowFieldGuideModal] = useState(false)
  const [showCollectionModal, setShowCollectionModal] = useState(false)
  const [showTutorial, setShowTutorial] = useState(() => {
    const seen = localStorage.getItem(TUTORIAL_SEEN_KEY)
    if (!seen) localStorage.setItem(TUTORIAL_SEEN_KEY, 'true')
    return !seen
  })
  const startGame = useGameStore((s) => s.startGame)
  const status = useGameStore((s) => s.status)
  const load = useReferenceStore((s) => s.load)

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (status === 'playing') navigate('/play')
  }, [status, navigate])

  function step(delta: number) {
    setSectionIndex((i) => (i + delta + SECTIONS.length) % SECTIONS.length)
  }

  const section = SECTIONS[sectionIndex].id

  return (
    <main className="mx-auto flex max-w-xl flex-col items-center gap-4 p-6 pt-16 text-center">
      <h1 className="text-5xl font-semibold tracking-wide text-ivory">Musicology Guesser</h1>
      <OrnamentDivider />
      <button
        type="button"
        onClick={() => setShowTutorial(true)}
        className="flex items-center gap-1.5 rounded-sm border border-gold/30 px-3 py-1 text-sm uppercase tracking-wide text-muted hover:border-gold/60 hover:text-ivory"
      >
        <HelpIcon className="h-4 w-4" />
        How to Play
      </button>
      <div className="w-full">
        <p className="mb-2 text-center text-base uppercase tracking-wide text-gold-soft">
          {SECTIONS[sectionIndex].label}
        </p>
        <div className="relative">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous"
            className="absolute -left-14 top-1/2 -translate-y-1/2 text-gold-soft transition-colors hover:text-gold"
          >
            <Triangle direction="left" className="h-16 w-10" />
          </button>

          <div className="marble-panel flex aspect-[1.618/1] w-full flex-col items-center justify-center gap-6 overflow-y-auto rounded-sm border border-gold/40 p-8">
            {section === 'guide' && (
              <>
                <BookIcon className="h-12 w-12 text-gold-soft" />
                <p className="text-muted">
                  Quick, fun hints on instrumentation, era, composer, and region — built for beginners who want a
                  nudge, not a lecture.
                </p>
                <button
                  type="button"
                  onClick={() => setShowFieldGuideModal(true)}
                  className="rounded-sm bg-gold px-6 py-3 font-medium text-gold-pale transition-colors hover:bg-gold-pale hover:text-gold"
                >
                  Browse the Field Guide
                </button>
              </>
            )}

            {section === 'play' && (
              <>
                <p className="text-muted">
                  You'll see a short excerpt of manuscript and a case file of evidence. Decide the instrumentation,
                  era, composer, and region — skip anything you're unsure of for a modest, honest 100 points.
                </p>
                <div className="flex gap-2">
                  {ROUND_OPTIONS.map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setRoundCount(count)}
                      className={`rounded-sm border px-4 py-2 text-sm uppercase tracking-wide ${
                        roundCount === count
                          ? 'border-gold bg-gold/20 text-gold-soft'
                          : 'border-gold/25 text-muted hover:border-gold/60'
                      }`}
                    >
                      {count} rounds
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={status === 'loading'}
                  onClick={() => startGame(roundCount)}
                  className="rounded-sm bg-gold px-6 py-3 font-medium text-gold-pale transition-colors hover:bg-gold-pale hover:text-gold disabled:opacity-60"
                >
                  {status === 'loading' ? 'Loading…' : 'Play'}
                </button>
              </>
            )}

            {section === 'collection' && (
              <>
                <CollectionIcon className="h-12 w-12 text-gold-soft" />
                <p className="text-muted">
                  Every piece you've practiced, organized by composer, rated by how well you did.
                </p>
                <button
                  type="button"
                  onClick={() => setShowCollectionModal(true)}
                  className="rounded-sm bg-gold px-6 py-3 font-medium text-gold-pale transition-colors hover:bg-gold-pale hover:text-gold"
                >
                  View Collection
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next"
            className="absolute -right-14 top-1/2 -translate-y-1/2 text-gold-soft transition-colors hover:text-gold"
          >
            <Triangle direction="right" className="h-16 w-10" />
          </button>
        </div>
      </div>

      {showFieldGuideModal && <FieldGuideModal onClose={() => setShowFieldGuideModal(false)} />}
      {showCollectionModal && <CollectionModal onClose={() => setShowCollectionModal(false)} />}
      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
    </main>
  )
}
