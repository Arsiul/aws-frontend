export interface FilterOption<T extends string> {
  value: T
  label: string
  count?: number
}

interface FilterChipsProps<T extends string> {
  options: FilterOption<T>[]
  value: T
  onChange: (value: T) => void
  ariaLabel: string
}

export function FilterChips<T extends string>({ options, value, onChange, ariaLabel }: FilterChipsProps<T>) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={`chip ${isActive ? 'chip-active' : 'chip-idle'}`}
          >
            {option.label}
            {option.count !== undefined && (
              <span className={`ml-1.5 ${isActive ? 'text-white/80' : 'text-text-secondary/70'}`}>{option.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
