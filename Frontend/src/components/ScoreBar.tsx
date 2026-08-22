interface ScoreBarProps {
  label: string
  points: number
  maxPoints: number
  correct: boolean
  skipped?: boolean
  detail?: string
}

export function ScoreBar({ label, points, maxPoints, correct, skipped, detail }: ScoreBarProps) {
  const percent = maxPoints === 0 ? 0 : Math.round((points / maxPoints) * 100)
  const fillClass = correct ? 'bg-gold' : skipped ? 'bg-muted' : 'bg-maroon'

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-ivory">
          {label}
          {skipped && <span className="ml-2 text-xs uppercase tracking-wide text-muted">skipped · honest</span>}
        </span>
        <span className={correct ? 'text-gold-soft' : 'text-muted'}>
          {points} / {maxPoints}
          {detail ? ` (${detail})` : ''}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-sm bg-ink-soft">
        <div className={`h-full rounded-sm ${fillClass}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
