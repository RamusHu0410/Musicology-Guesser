import type { Region } from '../types/domain'

interface EuropeMapProps {
  regions: Region[]
  value: string | null
  onChange: (regionId: string) => void
}

// Stylized, not cartographic — a schematic engraving-style layout, not real borders.
const MAP_REGIONS: Record<string, { x: number; y: number; width: number; height: number; rx: number }> = {
  'western-europe': { x: 10, y: 100, width: 95, height: 150, rx: 36 },
  'central-europe': { x: 115, y: 65, width: 90, height: 130, rx: 30 },
  italy: { x: 140, y: 205, width: 32, height: 105, rx: 15 },
  'eastern-europe': { x: 215, y: 100, width: 90, height: 130, rx: 30 },
  russia: { x: 215, y: 12, width: 135, height: 78, rx: 20 },
}

const VIEW_WIDTH = 360
const VIEW_HEIGHT = 320

export function EuropeMap({ regions, value, onChange }: EuropeMapProps) {
  const europeRegions = regions.filter((region) => region.id !== 'north-america')
  const outsideEurope = regions.find((region) => region.id === 'north-america')

  return (
    <div>
      <p className="mb-2 text-sm text-muted">Region</p>
      <div className="rounded-sm border border-gold/40 bg-ink-elevated p-3">
        <svg viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} className="w-full" role="group" aria-label="Region">
          <rect
            x={2}
            y={2}
            width={VIEW_WIDTH - 4}
            height={VIEW_HEIGHT - 4}
            rx={6}
            fill="none"
            stroke="rgba(201,162,39,0.25)"
            strokeWidth={1}
          />
          <text x={VIEW_WIDTH / 2} y={20} textAnchor="middle" className="fill-gold" style={{ fontSize: 12, letterSpacing: 2 }}>
            EUROPE
          </text>
          {europeRegions.map((region) => {
            const shape = MAP_REGIONS[region.id]
            if (!shape) return null
            const isSelected = value === region.id
            return (
              <g
                key={region.id}
                onClick={() => onChange(region.id)}
                role="button"
                aria-pressed={isSelected}
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') onChange(region.id)
                }}
                className="cursor-pointer"
              >
                <rect
                  x={shape.x}
                  y={shape.y}
                  width={shape.width}
                  height={shape.height}
                  rx={shape.rx}
                  fill={isSelected ? 'rgba(201,162,39,0.35)' : 'rgba(255,255,255,0.03)'}
                  stroke={isSelected ? '#e2c766' : 'rgba(154,149,138,0.5)'}
                  strokeWidth={isSelected ? 1.5 : 1}
                />
                <text
                  x={shape.x + shape.width / 2}
                  y={shape.y + shape.height / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={isSelected ? 'fill-gold-soft' : 'fill-ivory'}
                  style={{ fontSize: 11 }}
                >
                  {region.name}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
      {outsideEurope && (
        <button
          type="button"
          aria-pressed={value === outsideEurope.id}
          onClick={() => onChange(outsideEurope.id)}
          className={`mt-2 w-full rounded-sm border px-3 py-1.5 text-xs uppercase tracking-wide transition-colors ${
            value === outsideEurope.id
              ? 'border-gold bg-gold/20 text-gold-soft'
              : 'border-gold/30 text-muted hover:border-gold/60'
          }`}
        >
          Not pictured — {outsideEurope.name}
        </button>
      )}
    </div>
  )
}
