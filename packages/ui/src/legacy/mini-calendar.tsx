// mini-calendar.tsx
import { useMemo, useState, type CSSProperties } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from 'cn'

type CalendarView = 'days' | 'months' | 'years'

type MiniCalendarProps = {
  value?: Date | null
  onChange?: (date: Date) => void
  minDate?: Date
  maxDate?: Date
  /** Days of week to render as unavailable (hatched), e.g. [5, 6] for
   *  Fri/Sat. 0 = Sunday … 6 = Saturday. Empty by default — nothing is
   *  disabled unless you opt in. */
  disabledDaysOfWeek?: number[]
  /** 0 = Sunday … 6 = Saturday. Defaults to Saturday (Arabic week). */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  className?: string
}

const MONTH_NAMES = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
const WEEKDAY_LETTERS = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'] // Sun..Sat

// Diagonal hatch used for unavailable days — reads as "off-limits"
// without needing a strikethrough or a loud red tint.
const hatchStyle: CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(135deg, var(--border-subtle) 0px, var(--border-subtle) 1px, transparent 1px, transparent 6px)',
}

function isSameDay(a?: Date | null, b?: Date | null) {
  if (!a || !b) return false
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function buildMonthGrid(year: number, month: number, weekStartsOn: number) {
  const firstWeekday = new Date(year, month, 1).getDay()
  const leading = (firstWeekday - weekStartsOn + 7) % 7
  const gridStart = new Date(year, month, 1 - leading)
  return Array.from({ length: 42 }, (_, i) => new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i))
}

function isOutOfRange(date: Date, min?: Date, max?: Date) {
  if (min && date < new Date(min.getFullYear(), min.getMonth(), min.getDate())) return true
  if (max && date > new Date(max.getFullYear(), max.getMonth(), max.getDate())) return true
  return false
}

export function MiniCalendar({
  value,
  onChange,
  minDate,
  maxDate,
  disabledDaysOfWeek = [],
  weekStartsOn = 6,
  className,
}: MiniCalendarProps) {
  const today = useMemo(() => new Date(), [])
  const [cursor, setCursor] = useState(() => value ?? today)
  const [view, setView] = useState<CalendarView>('days')
  const [decadeStart, setDecadeStart] = useState(() => Math.floor((value ?? today).getFullYear() / 12) * 12)

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const grid = useMemo(() => buildMonthGrid(year, month, weekStartsOn), [year, month, weekStartsOn])
  const orderedWeekdays = useMemo(() => Array.from({ length: 7 }, (_, i) => WEEKDAY_LETTERS[(weekStartsOn + i) % 7]), [weekStartsOn])

  // Backward = right chevron, forward = left chevron — RTL calendar
  // convention, opposite of the LTR-instinctive mapping.
  const goBack = () => {
    if (view === 'days') setCursor(new Date(year, month - 1, 1))
    else if (view === 'months') setCursor(new Date(year - 1, month, 1))
    else setDecadeStart((d) => d - 12)
  }
  const goForward = () => {
    if (view === 'days') setCursor(new Date(year, month + 1, 1))
    else if (view === 'months') setCursor(new Date(year + 1, month, 1))
    else setDecadeStart((d) => d + 12)
  }

  const headerLabel =
    view === 'days' ? `${MONTH_NAMES[month]} ${year}` : view === 'months' ? String(year) : `${decadeStart} – ${decadeStart + 11}`

  const drillUp = () => {
    if (view === 'days') setView('months')
    else if (view === 'months') {
      setDecadeStart(Math.floor(year / 12) * 12)
      setView('years')
    }
  }

  const selectDay = (date: Date, disabled: boolean) => {
    if (disabled) return
    onChange?.(date)
    setCursor(date)
  }
  const selectMonth = (m: number) => { setCursor(new Date(year, m, 1)); setView('days') }
  const selectYear = (y: number) => { setCursor(new Date(y, month, 1)); setView('months') }

  return (
    <div className={cn('flex w-full max-w-80 flex-col gap-4 rounded-sm bg-surface', className)}>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goBack}
          aria-label="السابق"
          className="flex h-7 w-7 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-neutral-100 hover:text-text"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={drillUp}
          disabled={view === 'years'}
          className="rounded-sm px-2 py-1 text-[15px] font-bold text-text transition-colors hover:bg-neutral-100 disabled:cursor-default disabled:hover:bg-transparent"
        >
          {headerLabel}
        </button>

        <button
          type="button"
          onClick={goForward}
          aria-label="التالي"
          className="flex h-7 w-7 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-neutral-100 hover:text-text"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {view === 'days' && (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-7">
            {orderedWeekdays.map((w, i) => (
              <span key={i} className="flex h-6 items-center justify-center text-[12px] font-medium text-text-muted">
                {w}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1">
            {grid.map((date, i) => {
              const outside = date.getMonth() !== month
              const outOfRange = isOutOfRange(date, minDate, maxDate)
              const weekendDisabled = disabledDaysOfWeek.includes(date.getDay())
              const disabled = outOfRange || weekendDisabled
              const selected = isSameDay(date, value)
              const isToday = isSameDay(date, today)

              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectDay(date, disabled)}
                  style={weekendDisabled && !selected ? hatchStyle : undefined}
                  className={cn(
                    'relative  mx-auto flex h-8 w-8 items-center justify-center rounded-sm text-[13px] transition-colors',
                    'disabled:cursor-not-allowed disabled:hover:bg-transparent',
                    outside || outOfRange ? 'text-text-faint' : 'text-text',
                    weekendDisabled && !selected && 'text-text-faint ',
                    selected
                      ? 'bg-text font-semibold text-canvas'
                      : !disabled && 'hover:bg-neutral-100',
                  )}
                >
                  {date.getDate()}
                  {isToday && !selected && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" aria-hidden="true" />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {view === 'months' && (
        <div className="grid grid-cols-3 gap-2">
          {MONTH_NAMES.map((name, i) => (
            <button
              key={name}
              type="button"
              onClick={() => selectMonth(i)}
              className={cn(
                'rounded-sm py-2 text-[12px] font-medium transition-colors',
                i === month ? 'bg-text text-canvas' : 'text-text hover:bg-neutral-100',
              )}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {view === 'years' && (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 12 }, (_, i) => decadeStart + i).map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => selectYear(y)}
              className={cn(
                'rounded-sm py-2 text-[12px] font-medium transition-colors',
                y === year ? 'bg-text text-canvas' : 'text-text hover:bg-neutral-100',
              )}
            >
              {y}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}