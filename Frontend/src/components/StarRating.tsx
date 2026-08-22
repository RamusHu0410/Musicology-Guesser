function ratingFor(score: number, maxScore: number): { stars: number; colorClass: string } {
  if (maxScore <= 0 || score <= 0) return { stars: 0, colorClass: 'text-maroon' }
  const pct = score / maxScore
  if (pct >= 0.8) return { stars: 3, colorClass: 'text-gold' }
  if (pct >= 0.5) return { stars: 2, colorClass: 'text-gold-soft' }
  return { stars: 1, colorClass: 'text-muted' }
}

interface StarRatingProps {
  score: number
  maxScore: number
}

export function StarRating({ score, maxScore }: StarRatingProps) {
  const { stars, colorClass } = ratingFor(score, maxScore)
  return (
    <span className="text-xl" aria-label={`${stars} of 3 stars`}>
      {[0, 1, 2].map((i) => (
        <span key={i} className={i < stars ? colorClass : 'text-muted/25'}>
          ★
        </span>
      ))}
    </span>
  )
}
