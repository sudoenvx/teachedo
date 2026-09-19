import type { ReactNode } from 'react'
import { cn } from 'cn'

export interface ToggleOption {
  label: string
  value: string
  icon?: ReactNode
}

export interface ToggleGroupProps {
  options: ToggleOption[]
  value: string
  onChange: (value: string) => void
  className?: string
  size?: 'sm' | 'md'
}

export function ToggleGroup({
  options,
  value,
  onChange,
  className,
  size = 'sm',
}: ToggleGroupProps) {
  return (
    <div
      role="radiogroup"
      className={cn(
        'inline-flex w-fit gap-1 items-center rounded-sm bg-white p-1',
        className
      )}
    >
      {options.map((option) => {
        const isActive = value === option.value

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 rounded-sm font-medium transition-all duration-200 cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
              size === 'sm' ? 'h-6.5 px-2.5 text-[11px]' : 'h-8 px-3 text-[12px]',
              isActive
                ? 'bg-primary text-primary-foreground '
                : 'text-text-muted hover:text-text hover:bg-neutral-100'
            )}
          >
            {option.icon && (
              <span className={cn(
                'flex items-center justify-center [&>svg]:w-[1.2em] [&>svg]:h-[1.2em]',
                isActive ? 'text-primary-foreground' : 'text-text-muted'
              )}>
                {option.icon}
              </span>
            )}
            <span>{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}