import React from 'react'
import { X } from 'lucide-react'
import { cn } from 'cn'

export interface FloatingSelectionToolbarProps {
  /** Number of currently selected items — the toolbar renders nothing when this is 0 */
  count: number
  onClear: () => void
  /** Optional label override, e.g. "عنصر محدد" — defaults to Arabic "عنصر" */
  itemLabel?: string
  /** Action buttons rendered on the toolbar (e.g. delete, export selected) */
  children?: React.ReactNode
  className?: string
}

export function FloatingSelectionToolbar({
  count,
  onClear,
  itemLabel = 'عنصر',
  children,
  className,
}: FloatingSelectionToolbarProps) {
  if (count === 0) return null

  return (
    <div
      dir="rtl"
      className={cn(
        'fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 pointer-events-none',
        className,
      )}
    >
      <div className="flex items-center gap-3 rounded-sm bg-secondary p-1.5 pointer-events-auto">
        <button
          type="button"
          onClick={onClear}
          title="إلغاء التحديد"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-white/70 bg-white/10 hover:bg-white/20  hover:text-white transition-colors"
        >
          <X size={16} strokeWidth={2} />
        </button>

        <span className="text-[12px] font-medium whitespace-nowrap text-white/80 pe-1">
          تم تحديد {count} {itemLabel}
        </span>

        {children && (
          <div className="flex items-center gap-1.5 border-s border-white/25 ps-2">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}