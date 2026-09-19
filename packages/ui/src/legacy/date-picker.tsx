// date-picker.tsx
import { useId, useState } from 'react'
import { Calendar as CalendarIcon, X } from 'lucide-react'
import { Popover } from './popover'
import { MiniCalendar } from './mini-calendar'
import { FieldTrigger } from './field-trigger'
import { cn } from 'cn'

type DatePickerProps = {
  label?: string
  hint?: string
  error?: string
  value?: Date | null
  onChange: (date: Date | null) => void
  minDate?: Date
  maxDate?: Date
  disabledDaysOfWeek?: number[]
  placeholder?: string
  clearable?: boolean
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

const MONTH_NAMES = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']

function formatDisplay(date?: Date | null) {
  if (!date) return ''
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`
}

export function DatePicker({
  label, hint, error, value, onChange, minDate, maxDate, disabledDaysOfWeek,
  placeholder = 'اختر التاريخ', clearable = false, size = 'md', disabled,
}: DatePickerProps) {
  const id = useId()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={id} className={cn('w-fit text-[11px] font-medium', error ? 'text-destructive' : 'text-text')}>{label}</label>}

      <Popover
        open={open}
        onOpenChange={setOpen}
        align="start"
        trigger={
          <FieldTrigger
            id={id}
            leadingIcon={<CalendarIcon />}
            trailingIcon={
              clearable && value ? (
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="مسح التاريخ"
                  onClick={(e) => { e.stopPropagation(); onChange(null) }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onChange(null) } }}
                  className="pointer-events-auto rounded-xs hover:text-text"
                >
                  <X className="h-3.5 w-3.5" />
                </span>
              ) : undefined
            }
            placeholder={placeholder}
            hasValue={!!value}
            error={!!error}
            size={size}
            disabled={disabled}
          >
            {formatDisplay(value)}
          </FieldTrigger>
        }
        contentClassName="rounded-lg p-0 shadow-card"
      >
        <MiniCalendar
          value={value}
          onChange={(date) => { onChange(date); setOpen(false) }}
          minDate={minDate}
          maxDate={maxDate}
          disabledDaysOfWeek={disabledDaysOfWeek}
          className="shadow-none"
        />
      </Popover>

      {error ? <p className="text-[11px] text-destructive">{error}</p> : hint ? <p className="text-[11px] text-text-muted">{hint}</p> : null}
    </div>
  )
}