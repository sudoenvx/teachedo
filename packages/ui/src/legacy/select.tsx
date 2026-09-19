// select.tsx
import { ChevronsUpDown } from 'lucide-react'
import { useId, type ReactNode } from 'react'
import { DropdownMenu, DropdownMenuItem } from './dropdown-menu'
import { cn } from 'cn'
import { type FloatingAlign, type FloatingSide } from '../utils'

export type SelectOption = {
  value: string
  label: string
  icon?: ReactNode
}

type SelectProps = {
  label?: string
  hint?: string
  error?: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  disabled?: boolean
  variant?: 'neutral' | 'outline'
  className?: string
  searchable?: boolean
  side?: FloatingSide
  align?: FloatingAlign
  prefixIcon?: ReactNode
}

const SIZE_CLASSES = {
  xs: 'h-5.5 text-[11px] px-1.5',
  sm: 'h-6.5 text-[12px] px-2',
  md: 'h-7.5 text-[12px] px-2',
  lg: 'h-8.5 text-[13px] px-2.5',
}

export function Select({ label, hint, error, value, onChange, options, placeholder = 'اختر…', size = 'md', disabled, variant = 'outline', className, searchable = false, side = 'bottom', align = 'start', prefixIcon }: SelectProps) {
  const id = useId()
  const selected = options.find((o) => o.value === value)

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className={cn('w-fit text-[11px] font-medium', error ? 'text-destructive' : 'text-text')}>
          {label}
        </label>
      )}

      <DropdownMenu
        searchable={searchable}
        trigger={
          <button
            id={id}
            type="button"
            disabled={disabled}
            className={cn(
              'flex w-full items-center justify-between gap-2 rounded-[4px] text-start transition-colors',
              variant === 'neutral' ? 'bg-neutral-100 hover:bg-neutral-200' : 'border border-input-border bg-input-background',
              'hover:border-input-border-hover focus-visible:outline-none focus-visible:border-input-border-focus',
              'disabled:cursor-not-allowed disabled:bg-disabled-background disabled:text-disabled-foreground',
              error && 'border-destructive',
              SIZE_CLASSES[size],
              className,
            )}
          >
            <span className={cn('flex items-center gap-1.5 truncate text-[11px]', !selected && 'text-text-muted')}>
              {prefixIcon}
              {selected?.icon}
              {selected ? selected.label : placeholder}
            </span>
            <ChevronsUpDown className="h-3 w-3 shrink-0 text-text-muted" />
          </button>
        }
        align={align}
        side={side}
        menuClassName="w-[--radix-popper-anchor-width]"
      >
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            selected={option.value === value}
            icon={option.icon}
            onSelect={() => onChange(option.value)}
          >
            <span className="flex items-center gap-1.5">
              {option.label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenu>

      {error ? <p className="text-[11px] text-destructive">{error}</p> : hint ? <p className="text-[11px] text-text-muted">{hint}</p> : null}
    </div>
  )
}