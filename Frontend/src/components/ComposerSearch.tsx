import { useMemo, useState } from 'react'
import type { Composer } from '../types/domain'

interface ComposerSearchProps {
  composers: Composer[]
  value: string | null
  onChange: (composerId: string | null) => void
}

export function ComposerSearch({ composers, value, onChange }: ComposerSearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const selected = composers.find((c) => c.id === value) ?? null

  const matches = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return composers.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 8)
  }, [composers, query])

  return (
    <div className="relative">
      <label className="mb-1 block text-sm text-muted" htmlFor="composer-search">
        Composer
      </label>
      <input
        id="composer-search"
        type="text"
        value={selected ? selected.name : query}
        onChange={(event) => {
          setQuery(event.target.value)
          setIsOpen(true)
          if (selected) onChange(null)
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 100)}
        placeholder="Search for a composer..."
        autoComplete="off"
        className="w-full rounded-sm border border-gold/30 bg-ink-elevated px-3 py-2 text-ivory placeholder:text-muted focus:border-gold focus:outline-none"
      />
      {isOpen && matches.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-sm border border-gold/30 bg-ink-elevated shadow-lg">
          {matches.map((composer) => (
            <li key={composer.id}>
              <button
                type="button"
                onClick={() => {
                  onChange(composer.id)
                  setQuery('')
                  setIsOpen(false)
                }}
                className="w-full px-3 py-2 text-left text-ivory hover:bg-gold/15"
              >
                {composer.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
