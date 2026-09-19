import type { ComponentType, ReactNode } from 'react'
import { cn } from 'cn'

export type TabItem = {
  id: string
  label: ReactNode
  icon?: ComponentType<{ className?: string; size?: number; strokeWidth?: number }>
}

type TabsProps = {
  items: TabItem[]
  value: string
  onChange: (value: string) => void
  className?: string
  ariaLabel?: string
}

export function Tabs({ items, value, onChange, className, ariaLabel }: TabsProps) {
  return (
    <div className={cn('flex w-fit max-w-full gap-1 overflow-x-auto rounded-sm bg-surface p-1', className)} role="tablist" aria-label={ariaLabel}>
      {items.map(({ id, label, icon: Icon }) => {
        const selected = id === value
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(id)}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-sm px-3 py-1 text-[11px] font-medium transition-all duration-200',
              selected
                ? 'bg-primary-subtle text-text '
                : 'text-text-muted hover:bg-secondary-tint hover:text-text hover:bg-neutral-100'
            )}
          >
            {Icon && <Icon size={16} strokeWidth={2} />}
            {label}
          </button>
        )
      })}
    </div>
  )
}