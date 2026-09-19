// time-picker.tsx
import { useEffect, useId, useRef, useState } from 'react'
import { Clock } from 'lucide-react'
import { Popover } from './popover'
import { Button } from './button'
import { FieldTrigger } from './field-trigger'
import { cn } from 'cn'

export type TimePickerProps = {
  label?: string
  hint?: string
  error?: string
  value?: string | null // 24h "HH:mm", e.g. "14:30"
  onChange: (value: string) => void
  minuteStep?: number // default 5
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1) // 1..12
const PERIODS = [{ key: 'AM', label: 'ص' }, { key: 'PM', label: 'م' }] as const

function parse24h(value?: string | null) {
  if (!value) return null
  const [h, m] = value.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  const period: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return { hour12, minute: m, period }
}

function to24h(hour12: number, minute: number, period: 'AM' | 'PM') {
  const h = period === 'PM' ? (hour12 % 12) + 12 : hour12 % 12
  return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function formatDisplay(value?: string | null) {
  const parsed = parse24h(value)
  if (!parsed) return ''
  return `${String(parsed.hour12).padStart(2, '0')}:${String(parsed.minute).padStart(2, '0')} ${parsed.period === 'AM' ? 'ص' : 'م'}`
}

function TimeColumn<T extends string | number>({
  items, selected, onSelect, format,
}: { items: T[]; selected: T | undefined; onSelect: (v: T) => void; format: (v: T) => string }) {
  const selectedRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: 'center' })
  }, []) // scroll to selection once, on open

  return (
    <div className="flex h-40 w-14 flex-col gap-0.5 overflow-y-auto py-1">
      {items.map((item) => {
        const isSelected = item === selected
        return (
          <button
            key={item}
            ref={isSelected ? selectedRef : undefined}
            type="button"
            onClick={() => onSelect(item)}
            className={cn(
              'shrink-0 rounded-xs py-1.5 text-center text-[12px] font-medium transition-colors',
              isSelected ? 'bg-primary text-primary-foreground' : 'text-text hover:bg-neutral-100',
            )}
          >
            {format(item)}
          </button>
        )
      })}
    </div>
  )
}

export function TimePicker({ label, hint, error, value, onChange, minuteStep = 5, placeholder = 'اختر الوقت', size = 'md', disabled }: TimePickerProps) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const parsed = parse24h(value)
  const [draft, setDraft] = useState(() => parsed ?? { hour12: 12, minute: 0, period: 'AM' as const })

  useEffect(() => {
    if (open) setDraft(parsed ?? { hour12: 12, minute: 0, period: 'AM' })
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep)

  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={id} className={cn('w-fit text-[11px] font-medium', error ? 'text-destructive' : 'text-text')}>{label}</label>}

      <Popover
        open={open}
        onOpenChange={setOpen}
        align="start"
        trigger={
          <FieldTrigger id={id} leadingIcon={<Clock />} placeholder={placeholder} hasValue={!!value} error={!!error} size={size} disabled={disabled}>
            {formatDisplay(value)}
          </FieldTrigger>
        }
        contentClassName="rounded-sm p-2"
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-1">
            <TimeColumn items={HOURS} selected={draft.hour12} onSelect={(hour12) => setDraft((d) => ({ ...d, hour12 }))} format={(h) => String(h).padStart(2, '0')} />
            <TimeColumn items={minutes} selected={draft.minute} onSelect={(minute) => setDraft((d) => ({ ...d, minute }))} format={(m) => String(m).padStart(2, '0')} />
            <TimeColumn items={PERIODS.map((p) => p.key)} selected={draft.period} onSelect={(period) => setDraft((d) => ({ ...d, period }))} format={(key) => PERIODS.find((p) => p.key === key)!.label} />
          </div>
          <Button type="button" color="primary" style="solid" size="sm" className="w-full justify-center" onClick={() => { onChange(to24h(draft.hour12, draft.minute, draft.period)); setOpen(false) }}>
            تأكيد
          </Button>
        </div>
      </Popover>

      {error ? <p className="text-[11px] text-destructive">{error}</p> : hint ? <p className="text-[11px] text-text-muted">{hint}</p> : null}
    </div>
  )
}