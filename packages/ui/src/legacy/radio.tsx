// radio.tsx
import { type ReactNode, createContext, useContext, useId, useState } from 'react'
import { Card } from './card'
import { cn } from 'cn'

// ── RadioGroup context ─────────────────────────────────────────────

type RadioGroupContextValue = {
  name: string
  value: string | null
  onChange: (value: string) => void
  disabled?: boolean
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null)

type RadioGroupProps = {
  value: string | null
  onChange: (value: string) => void
  children: ReactNode
  disabled?: boolean
  className?: string
  name?: string
}

export function RadioGroup({ value, onChange, children, disabled, className, name }: RadioGroupProps) {
  const generatedName = useId()

  return (
    <RadioGroupContext.Provider value={{ name: name ?? generatedName, value, onChange, disabled }}>
      <div role="radiogroup" className={cn('flex flex-col gap-2', className)}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
}

// ── shared resolution helper ────────────────────────────────────────
// Works out `checked` + click handler whether Radio/RadioTile is used
// standalone (checked/onChange) or inside a RadioGroup (value).

type ResolvableProps =
  | { value?: never; checked: boolean; onChange: (checked: boolean) => void }
  | { value: string; checked?: never; onChange?: never }

function useResolvedRadio(props: ResolvableProps, disabledProp?: boolean) {
  const group = useContext(RadioGroupContext)
  const isGrouped = 'value' in props && props.value !== undefined

  const isChecked = isGrouped ? group?.value === props.value : (props as Extract<ResolvableProps, { checked: boolean }>).checked
  const isDisabled = disabledProp ?? group?.disabled

  const toggle = () => {
    if (isDisabled) return
    if (isGrouped) group?.onChange(props.value as string)
    else (props as Extract<ResolvableProps, { onChange: (checked: boolean) => void }>).onChange(!isChecked)
  }

  return { isChecked: !!isChecked, isDisabled, toggle }
}

// ── Radio ───────────────────────────────────────────────────────────

type RadioOwnProps = {
  label?: ReactNode
  disabled?: boolean
  className?: string
  'aria-label'?: string
}

type RadioProps = RadioOwnProps & ResolvableProps

export function RadioIndicator({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        'relative flex aspect-square h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 outline-none transition-colors duration-150',
        checked ? 'border-primary bg-primary' : 'border-border bg-surface',
      )}
    >
      <span
        className={cn(
          'aspect-square shrink-0 rounded-full bg-surface transition-all duration-150',
          checked ? 'h-2.5 w-2.5 opacity-100' : 'h-2.5 w-2.5 opacity-0',
        )}
      />
    </span>
  )
}

export function Radio({ label, disabled, className, ...props }: RadioProps) {
  const { isChecked, isDisabled, toggle } = useResolvedRadio(props, disabled)

  return (
    <label
      className={cn(
        'inline-flex items-center gap-2 select-none',
        isDisabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
        className,
      )}
    >
      <button
        type="button"
        role="radio"
        aria-checked={isChecked}
        aria-label={props['aria-label']}
        disabled={isDisabled}
        onClick={toggle}
        className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-1"
      >
        <RadioIndicator checked={isChecked} />
      </button>

      {label && <span className="text-[13px] font-medium text-text">{label}</span>}
    </label>
  )
}

// ── RadioTile ───────────────────────────────────────────────────────
// A selectable Card — radio indicator + title/description, whole card
// is clickable. Use inside a RadioGroup for exclusive plan/option pickers.

type RadioTileProps = RadioOwnProps & ResolvableProps & { description?: string; children?: ReactNode }

export function RadioTile({ label, description, disabled, className, children, ...props }: RadioTileProps) {
  const { isChecked, isDisabled, toggle } = useResolvedRadio(props, disabled)
  const [, setIsFocused] = useState(false)

  return (
    <div
      role="radio"
      aria-checked={isChecked}
      aria-disabled={isDisabled}
      tabIndex={isDisabled ? -1 : 0}
      onClick={toggle}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          toggle()
        }
      }}
      className={cn('outline-none', isDisabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer')}
    >
      <Card
        bodyClassName="p-2"
        className={cn(
          'border-2 transition-colors duration-150',
          isChecked ? 'border-primary bg-primary/10!' : 'border-border hover:border-text-muted',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0 flex-1">
            {label && <p className="m-0 text-sm font-bold leading-snug text-text">{label}</p>}
            {description && <p className="m-0 mt-1 text-xs leading-normal text-text-muted">{description}</p>}
            {children}
          </div>
          <RadioIndicator checked={isChecked} />
        </div>
      </Card>
    </div>
  )
}