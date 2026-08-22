import { useRef } from 'react'
import europeMapImage from '../assets/europe-map.png'
import { MAP_VIEW_HEIGHT, MAP_VIEW_WIDTH } from '../api/mockData'
import type { MapPoint, Region, RegionGuess } from '../types/domain'

interface EuropeMapProps {
  regions: Region[]
  /** Interactive mode: current guess (or null) and a setter. Omit both for read-only reveal mode. */
  value?: RegionGuess | null
  onChange?: (guess: RegionGuess) => void
  /** Reveal mode: the player's already-submitted pin and the true location, connected by a line. */
  guessPoint?: MapPoint | null
  answerPoint?: MapPoint | null
}

export function EuropeMap({ regions, value, onChange, guessPoint, answerPoint }: EuropeMapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const isInteractive = Boolean(onChange)
  const outsideEurope = regions.find((region) => region.id === 'north-america')
  const guessMarker = value?.type === 'map' ? value : guessPoint ?? null
  const isOutsideEuropeSelected = value?.type === 'outside-europe'

  function handleMapClick(event: React.MouseEvent<SVGSVGElement>) {
    if (!onChange || !svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * MAP_VIEW_WIDTH
    const y = ((event.clientY - rect.top) / rect.height) * MAP_VIEW_HEIGHT
    onChange({ type: 'map', x, y })
  }

  return (
    <div>
      {isInteractive && <p className="mb-2 text-base text-muted">Region — click the map to drop a pin</p>}
      <div className="rounded-sm border border-gold/50 bg-[#dcecec] p-3">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${MAP_VIEW_WIDTH} ${MAP_VIEW_HEIGHT}`}
          className={`w-full ${isInteractive ? 'cursor-crosshair' : ''}`}
          onClick={isInteractive ? handleMapClick : undefined}
          role={isInteractive ? 'button' : 'img'}
          aria-label="Region"
        >
          <image href={europeMapImage} x={0} y={0} width={MAP_VIEW_WIDTH} height={MAP_VIEW_HEIGHT} preserveAspectRatio="none" />
          <rect
            x={1}
            y={1}
            width={MAP_VIEW_WIDTH - 2}
            height={MAP_VIEW_HEIGHT - 2}
            rx={4}
            fill="none"
            stroke="rgba(147,112,29,0.35)"
            strokeWidth={1}
          />

          {answerPoint && guessMarker && (
            <line
              x1={guessMarker.x}
              y1={guessMarker.y}
              x2={answerPoint.x}
              y2={answerPoint.y}
              stroke="#93701d"
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
          )}
          {guessMarker && (
            <circle cx={guessMarker.x} cy={guessMarker.y} r={6} fill="#93701d" stroke="#fdfbf3" strokeWidth={2} />
          )}
          {answerPoint && (
            <circle cx={answerPoint.x} cy={answerPoint.y} r={7} fill="none" stroke="#93701d" strokeWidth={2.5} />
          )}
        </svg>
      </div>
      {outsideEurope && isInteractive && (
        <button
          type="button"
          aria-pressed={isOutsideEuropeSelected}
          onClick={() => onChange?.({ type: 'outside-europe' })}
          className={`mt-2 w-full rounded-sm border px-3 py-1.5 text-xs uppercase tracking-wide transition-colors ${
            isOutsideEuropeSelected ? 'border-gold bg-gold/20 text-gold-soft' : 'border-gold/30 text-muted hover:border-gold/60'
          }`}
        >
          Not pictured — {outsideEurope.name}
        </button>
      )}
    </div>
  )
}
