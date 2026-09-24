import type { ComponentType, ReactNode } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { cn } from 'cn'

type StatisticIcon = ComponentType<{
  className?: string
  strokeWidth?: number
}>

export type StatisticCardProps = {
  label: string
  value: string
  icon: StatisticIcon
  iconClassName?: string
  className?: string
  /** Custom content such as a trend badge, mini chart, or progress bar. */
  description?: (label: string, value: string) => ReactNode
}

export function StatisticCard({
  label,
  value,
  icon: Icon,
  iconClassName,
  className,
  description,
}: StatisticCardProps) {
  return (
    <Card size="sm" className={cn('rounded-md', className)}>
      <CardContent>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-xs font-medium text-text-secondary">
              {label}
            </p>

            <p className="mt-1 truncate font-inter text-base font-medium leading-none tracking-tight text-text-muted tabular-nums">
              {value}
            </p>
          </div>

          <span
            className={cn(
              'inline-flex h-8 w-8 shrink-0 items-center justify-center',
              'rounded-[calc(var(--radius-md)-0.15rem)]',
              'bg-neutral-200 text-neutral-600',
              iconClassName,
            )}
          >
            <Icon className="size-[18px]" strokeWidth={1.8} />
          </span>
        </div>

        {description && (
          <div className="mt-3">
            {description(label, value)}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
