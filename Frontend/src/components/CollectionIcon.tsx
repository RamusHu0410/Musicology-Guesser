interface CollectionIconProps {
  className?: string
}

export function CollectionIcon({ className }: CollectionIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="7.5" y="3" width="12" height="14.5" rx="1" />
      <rect x="4.5" y="6.5" width="12" height="14.5" rx="1" fill="var(--color-ink-elevated)" />
      <path d="M8.5 11.5h6" />
      <path d="M8.5 14.5h4" />
    </svg>
  )
}
