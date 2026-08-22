interface BookIconProps {
  className?: string
}

export function BookIcon({ className }: BookIconProps) {
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
      <path d="M12 6.2c-1.9-1.4-4.4-1.9-7.3-1.6v12.9c2.9-.3 5.4.2 7.3 1.6 1.9-1.4 4.4-1.9 7.3-1.6V4.6c-2.9-.3-5.4.2-7.3 1.6Z" />
      <path d="M12 6.2v12.9" />
      <path d="M6.3 8.3c1.4-.2 2.9 0 4.2.6" />
      <path d="M6.3 11.3c1.4-.2 2.9 0 4.2.6" />
      <path d="M6.3 14.3c1.4-.2 2.9 0 4.2.6" />
      <path d="M13.5 8.9c1.3-.6 2.8-.8 4.2-.6" />
      <path d="M13.5 11.9c1.3-.6 2.8-.8 4.2-.6" />
      <path d="M13.5 14.9c1.3-.6 2.8-.8 4.2-.6" />
    </svg>
  )
}
