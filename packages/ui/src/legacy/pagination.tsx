import { ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-react'
import React from 'react'
import { IconButton } from './icon-button'
import { Select } from './select'
import { cn } from 'cn'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  perPage: number
  onPageChange: (page: number) => void
  onPerPageChange?: (perPage: number) => void
  perPageOptions?: number[]
  /** Hide the per-page selector entirely (e.g. if the parent doesn't
   *  support changing page size). Shown by default when
   *  `onPerPageChange` is provided. */
  showPerPageSelect?: boolean
  className?: string
  size?: 'sm' | 'md'
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  perPage,
  onPageChange,
  onPerPageChange,
  perPageOptions = [10, 20, 30],
  showPerPageSelect = true,
  className,
  size = 'md',
}: PaginationProps) {
  const pages = buildPageSequence(currentPage, totalPages)

  const start = totalItems === 0 ? 0 : (currentPage - 1) * perPage + 1
  const end = Math.min(currentPage * perPage, totalItems)

  return (
    <div dir="rtl" className={cn('flex min-w-0 max-w-full flex-wrap items-center justify-between gap-3', size === 'md' && 'flex-col-reverse sm:flex-row', className)}>
      <div className="flex items-center gap-2">
        <span className={cn('text-[12px] text-text-muted', size === 'sm' && 'hidden')}>
          عرض <span className="font-semibold tabular-nums text-text">{start}</span>
          {' – '}
          <span className="font-semibold tabular-nums text-text">{end}</span>
          {' من أصل '}
          <span className="font-semibold tabular-nums text-text">{totalItems}</span>
          {' نتيجة'}
        </span>

        {onPerPageChange && showPerPageSelect && (
          <div className="flex items-center gap-1.5">
            <Select
              variant='neutral'
              align='end'
              size="xs"
              value={String(perPage)}
              onChange={(value) => onPerPageChange(Number(value))}
              options={perPageOptions.map((n) => ({ value: String(n), label: `${n} / صفحة` }))}
            />
          </div>
        )}
      </div>

      <div className="flex min-w-0 max-w-full flex-wrap items-center gap-1">
        {totalPages > 1 && (
          <IconButton
            icon={<ChevronsRight size={13} />}
            color="neutral"
            style="ghost"
            size="sm"
            aria-label="الصفحة الأولى"
            disabled={currentPage === 1}
            onClick={() => onPageChange(1)}
          />
        )}
        {/* "السابق" (previous) visually points toward the start of reading (right) in RTL */}
        <IconButton
          icon={<ChevronRight size={13} />}
          color="neutral"
          style="ghost"
          size="sm"
          aria-label="الصفحة السابقة"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        />

        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`dots-${i}`} className="px-1 text-[12px] text-text-muted">…</span>
          ) : (
            <PgBtn key={p} active={p === currentPage} onClick={() => onPageChange(p as number)}>
              {p}
            </PgBtn>
          ),
        )}

        {/* "التالي" (next) visually points toward the end of reading (left) in RTL */}
        <IconButton
          icon={<ChevronLeft size={13} />}
          color="neutral"
          style="ghost"
          size="sm"
          aria-label="الصفحة التالية"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        />
        {totalPages > 1 && (
          <IconButton
            icon={<ChevronsLeft size={13} />}
            color="neutral"
            style="ghost"
            size="sm"
            aria-label="الصفحة الأخيرة"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(totalPages)}
          />
        )}
      </div>
    </div>
  )
}

function PgBtn({ children, onClick, active }: { children: React.ReactNode; onClick?: () => void; active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex h-6 min-w-6 items-center justify-center rounded-xs px-1.5 font-inter text-[12px] font-medium tabular-nums transition-colors',
        active ? 'bg-secondary text-secondary-foreground' : 'bg-neutral-100 text-text hover:bg-neutral-200',
      )}
    >
      {children}
    </button>
  )
}

function buildPageSequence(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '…')[] = [1]
  if (current > 3) pages.push('…')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('…')
  pages.push(total)
  return pages
}