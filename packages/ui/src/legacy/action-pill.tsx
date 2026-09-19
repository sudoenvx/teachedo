import type { ReactNode } from 'react'
import { cn } from 'cn'

export interface ActionPillProps {
  prefix?: ReactNode
  suffix?: ReactNode
  icon?: ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  prefixClassName?: string
  suffixClassName?: string
  iconClassName?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeStyles = {
  sm: 'h-7 px-2 text-[11px] gap-1.5',
  md: 'h-8.5 px-2.5 text-[12px] gap-2',
  lg: 'h-10 px-3 text-[13px] gap-2.5',
}

export function ActionPill({
  prefix,
  suffix,
  icon,
  onClick,
  disabled = false,
  className,
  prefixClassName,
  suffixClassName,
  iconClassName,
  size = 'md',
}: ActionPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center rounded-md border border-border bg-surface transition-all duration-200',
        onClick && 'hover:bg-creamy hover:border-secondary/40 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        !onClick && 'cursor-default',
        'disabled:opacity-50 disabled:pointer-events-none',
        sizeStyles[size],
        className
      )}
    >
      <div className="flex items-center gap-1.5 shrink-0">
        {icon && (
          <span className={cn('flex items-center justify-center text-text-muted [&>svg]:w-[1.2em] [&>svg]:h-[1.2em]', iconClassName)}>
            {icon}
          </span>
        )}
        {prefix && (
          <span className={cn('font-medium text-text-muted', prefixClassName)}>
            {prefix}
          </span>
        )}
      </div>

      {suffix && (
        <div className={cn('flex items-center min-w-0 font-semibold text-primary-hover truncate', suffixClassName)}>
          {suffix}
        </div>
      )}
    </button>
  )
}