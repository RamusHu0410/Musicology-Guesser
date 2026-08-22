import { useMemo } from 'react'
import { ERA_BANDS, eraForYear } from '../constants/eras'

interface EraTimelineSliderProps {
  value: number
  onChange: (year: number) => void
}

// Each era gets an equal-width, equal-precision slice of the slider regardless of how many real
// years it spans — otherwise Medieval (900 years) would dominate the bar while Contemporary
// (50 years) would be a sliver too small to drag precisely, making some eras easier to score well
// on than others for reasons that have nothing to do with musical knowledge.
const SEGMENT_RESOLUTION = 1000

function yearToVirtual(year: number): number {
  const eraIndex = Math.max(0, ERA_BANDS.findIndex((band) => year >= band.startYear && year < band.endYear))
  const band = ERA_BANDS[eraIndex]
  const fraction = (year - band.startYear) / (band.endYear - band.startYear)
  return eraIndex * SEGMENT_RESOLUTION + fraction * SEGMENT_RESOLUTION
}

function virtualToYear(virtual: number): number {
  const eraIndex = Math.min(ERA_BANDS.length - 1, Math.max(0, Math.floor(virtual / SEGMENT_RESOLUTION)))
  const band = ERA_BANDS[eraIndex]
  const fraction = (virtual - eraIndex * SEGMENT_RESOLUTION) / SEGMENT_RESOLUTION
  return Math.round(band.startYear + fraction * (band.endYear - band.startYear))
}

export function EraTimelineSlider({ value, onChange }: EraTimelineSliderProps) {
  const era = eraForYear(value)
  const virtualValue = useMemo(() => yearToVirtual(value), [value])
  const maxVirtual = ERA_BANDS.length * SEGMENT_RESOLUTION - 1

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-sm text-muted" htmlFor="era-timeline">
          Era / Year
        </label>
        <span className="text-sm text-gold">
          {value} · {era.name}
        </span>
      </div>
      <div className="relative py-2">
        <div className="flex h-3 w-full overflow-hidden rounded-sm border border-gold/30">
          {ERA_BANDS.map((band, index) => (
            <div
              key={band.id}
              title={band.name}
              className="h-full flex-1 border-r border-ink last:border-r-0"
              style={{ backgroundColor: `rgba(201, 162, 39, ${0.18 + (index / (ERA_BANDS.length - 1)) * 0.62})` }}
            />
          ))}
        </div>
        <input
          id="era-timeline"
          type="range"
          min={0}
          max={maxVirtual}
          value={Math.round(virtualValue)}
          onChange={(event) => onChange(virtualToYear(Number(event.target.value)))}
          className="timeline-slider absolute inset-x-0 top-0 w-full"
        />
      </div>
      <div className="flex text-[9px] uppercase text-muted">
        {ERA_BANDS.map((band) => (
          <span key={band.id} className="flex-1 overflow-hidden truncate px-0.5 text-center">
            {band.name}
          </span>
        ))}
      </div>
    </div>
  )
}
