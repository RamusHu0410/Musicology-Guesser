import { useState } from 'react'

interface SheetMusicViewerProps {
  imageUrl: string
}

const MIN_SCALE = 1
const MAX_SCALE = 3
const SCALE_STEP = 0.25

export function SheetMusicViewer({ imageUrl }: SheetMusicViewerProps) {
  const [scale, setScale] = useState(MIN_SCALE)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end gap-2">
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => setScale((s) => Math.max(MIN_SCALE, s - SCALE_STEP))}
          className="rounded-sm border border-gold/30 px-3 py-1 text-sm text-ivory hover:border-gold/60"
        >
          −
        </button>
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => setScale((s) => Math.min(MAX_SCALE, s + SCALE_STEP))}
          className="rounded-sm border border-gold/30 px-3 py-1 text-sm text-ivory hover:border-gold/60"
        >
          +
        </button>
      </div>
      <div className="marble-panel overflow-auto rounded-sm border border-gold/40 p-4">
        <img
          src={imageUrl}
          alt="Sheet music excerpt to identify"
          style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
          className="max-w-full transition-transform"
        />
      </div>
    </div>
  )
}
