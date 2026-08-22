interface TriangleProps {
  direction: 'left' | 'right'
  className?: string
}

export function Triangle({ direction, className }: TriangleProps) {
  const points = direction === 'left' ? '19,2 19,22 3,12' : '3,2 3,22 19,12'
  return (
    <svg viewBox="0 0 22 24" className={className} fill="currentColor" aria-hidden="true">
      <polygon points={points} />
    </svg>
  )
}
