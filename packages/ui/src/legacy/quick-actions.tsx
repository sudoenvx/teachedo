// quick-actions.tsx
import { ArrowUpRight, Zap, X } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { Popover } from './popover'
import { IconButton } from './icon-button'

export type QuickActionItem = {
  id: string
  icon: ReactNode
  label: string
  onClick: () => void
  chipClassName?: string
}

type QuickActionsProps = {
  actions: QuickActionItem[]
  title?: string
  /** Columns in the grid. Defaults to a sensible auto value based on count. */
  columns?: number
  align?: 'start' | 'center' | 'end'
}

export function QuickActions({ actions, columns, align = 'end' }: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const gridColumns = columns ?? (actions.length <= 4 ? 2 : actions.length <= 9 ? 3 : 4)

  return (
    <div className="pointer-events-none absolute bottom-5 right-18 z-50">
      <Popover
        open={isOpen}
        onOpenChange={setIsOpen}
        side="top"
        align={align}
        offset={12}
        trigger={
          <IconButton
            icon={isOpen ? <X className='w-5.5! h-5.5!'/> : <Zap className='w-5.5! h-5.5!'/>}
            color={isOpen ? 'danger' : 'accent'}
            style="solid"
            size="lg"
            aria-label={isOpen ? 'إغلاق الإجراءات السريعة' : 'فتح الإجراءات السريعة'}
            className="pointer-events-auto h-9 w-9 rounded-sm shadow-card"
          />
        }
        contentClassName="rounded-sm border border-border-subtle bg-surface p-2 shadow-elevated"
      >


        <div className="grid min-w-48 gap-1" style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}>
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => {
                action.onClick()
                setIsOpen(false)
              }}
              className="pointer-events-auto group flex w-full flex-col items-center gap-1.5 rounded-sm bg-neutral-50 px-2 py-2.5 text-center transition-colors hover:bg-primary-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-1"
            >
              {/* <span
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-sm [&>svg]:h-4.5 [&>svg]:w-4.5',
                  action.chipClassName ?? 'bg-primary-subtle text-primary-subtle-foreground',
                )}
              >
              </span> */}
                <span className={`flex h-7 w-7 items-center justify-center rounded-sm text-primary [&>svg]:h-4 [&>svg]:w-4 ${action.chipClassName ?? 'bg-primary-subtle'}`}>
                  {action.icon}
                </span>
              <span className="line-clamp-2 text-[10px] font-semibold leading-tight text-text">{action.label}</span>
            </button>
          ))}
        </div>
      </Popover>
    </div>
  )
}