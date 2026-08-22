interface HelpIconProps {
  className?: string
}

export function HelpIcon({ className }: HelpIconProps) {
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
      <circle cx="12" cy="12" r="9.5" />
      <path d="M9.2 9.4a2.8 2.8 0 1 1 3.9 2.6c-.8.4-1.1.9-1.1 1.7v.4" />
      <circle cx="12" cy="16.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}
