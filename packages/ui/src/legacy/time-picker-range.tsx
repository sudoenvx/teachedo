import { useEffect, useId, useState, useRef } from 'react'
import { Clock } from 'lucide-react'
import { Popover } from './popover'
import { Button } from './button'
import { FieldTrigger } from './field-trigger'
import { cn } from 'cn'

export type TimeRange = { start: string | null; end: string | null } // "HH:mm"

type TimeRangePickerProps = {
  label?: string
  hint?: string
  error?: string
  value?: TimeRange
  onChange: (value: TimeRange) => void
  minuteStep?: number
  showMinutes?: boolean // NEW: Make minutes optional
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

type DraftTime = { hour: number; minute: number }

const HOURS_24 = Array.from({ length: 24 }, (_, i) => i)

// Helpers for 24h
function parse24h(value?: string | null): DraftTime | null {
  if (!value) return null
  const [h, m] = value.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return { hour: h, minute: m }
}

function to24h(draft: DraftTime) {
  return `${String(draft.hour).padStart(2, '0')}:${String(draft.minute).padStart(2, '0')}`
}

function getMinutesFromMidnight(draft: DraftTime) {
  return draft.hour * 60 + draft.minute
}

function fromMinutesFromMidnight(mins: number): DraftTime {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return { hour: h, minute: m }
}

/* ========================================================================
   Time Column Component (Smooth Snap UX)
   ======================================================================== */
function TimeColumn<T extends number>({
  items, selected, onSelect, format, label
}: {
  items: T[]; selected: T; onSelect: (v: T) => void; format: (v: T) => string; label: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to center on mount
  useEffect(() => {
    const activeEl = containerRef.current?.querySelector('[data-selected="true"]')
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'center' })
    }
  }, [])

  return (
    <div className="flex w-12 flex-col">
      <span className="mb-1.5 text-center text-[10px] font-bold text-text-muted">{label}</span>
      <div
        ref={containerRef}
        className="flex h-36 flex-col gap-1 overflow-y-auto px-1 py-[52px] snap-y snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {items.map((item) => {
          const isSelected = item === selected
          return (
            <button
              key={item}
              type="button"
              data-selected={isSelected}
              onClick={() => onSelect(item)}
              className={cn(
                'shrink-0 h-8 w-full rounded-xs text-center transition-all duration-200 snap-center',
                isSelected
                  ? 'bg-primary text-primary-foreground text-[14px] font-bold shadow-sm scale-110 z-10'
                  : 'text-[12px] font-medium text-text hover:bg-surface-secondary'
              )}
            >
              {format(item)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ========================================================================
   Main Picker Component
   ======================================================================== */
export function TimeRangePicker({
  label,
  hint,
  error,
  value,
  onChange,
  minuteStep = 5,
  showMinutes = true,
  placeholder = 'اختر الفترة الزمنية',
  size = 'md',
  disabled
}: TimeRangePickerProps) {
  const id = useId()
  const [open, setOpen] = useState(false)

  // Default to 09:00 and 10:00
  const [draftStart, setDraftStart] = useState<DraftTime>(() => parse24h(value?.start) ?? { hour: 9, minute: 0 })
  const [draftEnd, setDraftEnd] = useState<DraftTime>(() => parse24h(value?.end) ?? { hour: 10, minute: 0 })

  useEffect(() => {
    if (!open) return
    setDraftStart(parse24h(value?.start) ?? { hour: 9, minute: 0 })
    setDraftEnd(parse24h(value?.end) ?? { hour: 10, minute: 0 })
  }, [open, value])

  const minutesList = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep)

  // Validation
  const startMinutes = getMinutesFromMidnight(draftStart)
  const endMinutes = getMinutesFromMidnight(draftEnd)
  const rangeInvalid = endMinutes <= startMinutes

  // Smart Handler: Auto-bumps End time if Start time passes it
  const handleStartChange = (key: keyof DraftTime, val: number) => {
    const newStart = { ...draftStart, [key]: val }
    setDraftStart(newStart)

    const newStartMins = getMinutesFromMidnight(newStart)
    if (newStartMins >= endMinutes) {
      let autoNewEnd = newStartMins + (showMinutes ? minuteStep : 60)
      if (autoNewEnd > 1439) autoNewEnd = 1439 // Cap at 23:59
      setDraftEnd(fromMinutesFromMidnight(autoNewEnd))
    }
  }

  const handleEndChange = (key: keyof DraftTime, val: number) => {
    setDraftEnd({ ...draftEnd, [key]: val })
  }

  // Format exactly what user sees on the trigger button
  const displayValue = value?.start && value?.end
    ? `${value.start} — ${value.end}`
    : ''

  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={id} className={cn('w-fit text-[13px] font-bold', error ? 'text-destructive' : 'text-text')}>{label}</label>}

      <Popover
        open={open}
        onOpenChange={setOpen}
        align="start"
        trigger={
          <FieldTrigger id={id} leadingIcon={<Clock size={16} />} placeholder={placeholder} hasValue={!!displayValue} error={!!error} size={size} disabled={disabled}>
            {displayValue}
          </FieldTrigger>
        }
        contentClassName="rounded-md p-4 bg-surface shadow-elevated border border-border"
      >
        <div className="flex flex-col gap-4">

          <div className="flex items-start gap-4">

            {/* START TIME COLUMN (من) */}
            <div className="flex flex-col items-center flex-1 relative">
              <span className="mb-2 text-[11px] font-bold uppercase text-text-faint bg-surface-secondary px-3 py-1 rounded-full">من</span>

              <div className="flex gap-1 relative">
                {/* Highlight Background */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-8 bg-surface-secondary/50 border-y border-border-subtle pointer-events-none rounded-xs" />

                <TimeColumn
                  label="ساعة"
                  items={HOURS_24}
                  selected={draftStart.hour}
                  onSelect={(v) => handleStartChange('hour', v)}
                  format={(h) => String(h).padStart(2, '0')}
                />

                {showMinutes && (
                  <TimeColumn
                    label="دقيقة"
                    items={minutesList}
                    selected={draftStart.minute}
                    onSelect={(v) => handleStartChange('minute', v)}
                    format={(m) => String(m).padStart(2, '0')}
                  />
                )}
              </div>
            </div>

            {/* DIVIDER */}
            <div className="w-px h-[180px] bg-border-subtle self-center opacity-50" />

            {/* END TIME COLUMN (إلى) */}
            <div className="flex flex-col items-center flex-1 relative">
              <span className="mb-2 text-[11px] font-bold uppercase text-text-faint bg-surface-secondary px-3 py-1 rounded-full">إلى</span>

              <div className="flex gap-1 relative">
                {/* Highlight Background */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-8 bg-surface-secondary/50 border-y border-border-subtle pointer-events-none rounded-xs" />

                <TimeColumn
                  label="ساعة"
                  items={HOURS_24}
                  selected={draftEnd.hour}
                  onSelect={(v) => handleEndChange('hour', v)}
                  format={(h) => String(h).padStart(2, '0')}
                />

                {showMinutes && (
                  <TimeColumn
                    label="دقيقة"
                    items={minutesList}
                    selected={draftEnd.minute}
                    onSelect={(v) => handleEndChange('minute', v)}
                    format={(m) => String(m).padStart(2, '0')}
                  />
                )}
              </div>
            </div>

          </div>

          <div className="flex flex-col gap-2 pt-3 border-t border-border-subtle">
            {rangeInvalid && (
              <p className="m-0 text-[11px] font-bold text-center text-destructive bg-destructive-subtle py-1 rounded-xs">
                وقت النهاية يجب أن يكون بعد وقت البداية.
              </p>
            )}

            <Button
              type="button"
              color="primary"
              style="solid"
              size="sm"
              className="w-full justify-center font-bold h-9"
              disabled={rangeInvalid}
              onClick={() => {
                // If showMinutes is false, we force minutes to 00
                const finalStart = showMinutes ? draftStart : { ...draftStart, minute: 0 }
                const finalEnd = showMinutes ? draftEnd : { ...draftEnd, minute: 0 }

                onChange({ start: to24h(finalStart), end: to24h(finalEnd) })
                setOpen(false)
              }}
            >
              تأكيد
            </Button>
          </div>
        </div>
      </Popover>

      {error ? <p className="text-[11px] font-medium text-destructive mt-1">{error}</p> : hint ? <p className="text-[11px] text-text-muted mt-1">{hint}</p> : null}
    </div>
  )
}