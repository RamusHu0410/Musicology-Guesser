interface ChipOption {
  id: string
  name: string
}

interface ChipSelectProps {
  label: string
  options: ChipOption[]
  value: string | null
  onChange: (id: string) => void
}

export function ChipSelect({ label, options, value, onChange }: ChipSelectProps) {
  return (
    <div>
      <span className="mb-2 block text-sm text-muted">{label}</span>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={value === option.id}
            onClick={() => onChange(option.id)}
            className={`rounded-sm border px-3 py-1.5 text-sm uppercase tracking-wide transition-colors ${
              value === option.id
                ? 'border-gold bg-gold/20 text-gold-soft'
                : 'border-gold/25 bg-ink-elevated text-ivory hover:border-gold/60'
            }`}
          >
            {option.name}
          </button>
        ))}
      </div>
    </div>
  )
}
