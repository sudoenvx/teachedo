// checkbox.tsx
import { type ReactNode, createContext, useContext, useState } from 'react'
import { Check } from 'lucide-react'
import { Card } from './card'
import { cn } from 'cn'

// ── CheckboxGroup context ──────────────────────────────────────────
// For multi-select groups (unlike RadioGroup, value is an array).

type CheckboxGroupContextValue = {
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
}

const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null)

type CheckboxGroupProps = {
  value: string[]
  onChange: (value: string[]) => void
  children: ReactNode
  disabled?: boolean
  className?: string
}

export function CheckboxGroup({ value, onChange, children, disabled, className }: CheckboxGroupProps) {
  return (
    <CheckboxGroupContext.Provider value={{ value, onChange, disabled }}>
      <div role="group" className={cn('flex flex-col gap-2', className)}>
        {children}
      </div>
    </CheckboxGroupContext.Provider>
  )
}

// ── shared resolution helper ────────────────────────────────────────
// Works out `checked` + click handler whether Checkbox/CheckboxTile is
// used standalone (checked/onChange) or inside a CheckboxGroup (value).

type ResolvableProps =
  | { value?: never; checked: boolean; onChange: (checked: boolean) => void }
  | { value: string; checked?: never; onChange?: never }

function useResolvedCheckbox(props: ResolvableProps, disabledProp?: boolean) {
  const group = useContext(CheckboxGroupContext)
  const isGrouped = 'value' in props && props.value !== undefined

  const isChecked = isGrouped ? !!group?.value.includes(props.value as string) : (props as Extract<ResolvableProps, { checked: boolean }>).checked
  const isDisabled = disabledProp ?? group?.disabled

  const toggle = () => {
    if (isDisabled) return
    if (isGrouped) {
      const v = props.value as string
      const current = group?.value ?? []
      const next = current.includes(v) ? current.filter((item) => item !== v) : [...current, v]
      group?.onChange(next)
    } else {
      ; (props as Extract<ResolvableProps, { onChange: (checked: boolean) => void }>).onChange(!isChecked)
    }
  }

  return { isChecked: !!isChecked, isDisabled, toggle }
}

// ── Checkbox ────────────────────────────────────────────────────────

type CheckState = boolean | 'indeterminate'

type CheckboxOwnProps = {
  label?: ReactNode
  disabled?: boolean
  className?: string
  indicatorClassName?: string
  indicatorInnerClassName?: string
  'aria-label'?: string
  // When true, renders a dash instead of a checkmark and reports
  // aria-checked="mixed", regardless of the resolved checked value.
  // Typical use: a "select all" checkbox for a group that's partially selected.
  indeterminate?: boolean
}

type CheckboxProps = CheckboxOwnProps & ResolvableProps


export function CheckboxIndicator({ checked, className, innerClassName }: { checked: CheckState; className?: string; innerClassName?: string }) {
  const isIndeterminate = checked === 'indeterminate'
  const isOn = isIndeterminate || checked === true

  return (
    <span
      className={cn(
        'relative flex aspect-square h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border  outline-none transition-colors duration-150',
        isOn ? 'border-primary bg-primary' : 'border-border bg-surface',
        className,
      )}
    >
      {isIndeterminate ? (
        <div className="h-2.5 flex justify-center items-center">
          <span className="h-0.5 w-2 shrink-0 rounded-xs bg-white transition-all duration-150" />
        </div>
      ) : (
        <span
          className={cn(
            'absolute h-2.5 w-2.5 flex shrink-0 rounded-xs text-white transition-all duration-150',
            isOn ? 'scale-100 opacity-100' : 'scale-0 opacity-0',
            innerClassName,
          )}
        >
          <Check className="h-full w-full" strokeWidth={3} />
        </span>
      )}
    </span>
  )
}

export function Checkbox({ label, disabled, className, indicatorClassName, indicatorInnerClassName, indeterminate, ...props }: CheckboxProps) {
  const { isChecked, isDisabled, toggle } = useResolvedCheckbox(props, disabled)
  const displayState: CheckState = indeterminate ? 'indeterminate' : isChecked

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
        role="checkbox"
        aria-checked={indeterminate ? 'mixed' : isChecked}
        aria-label={props['aria-label']}
        disabled={isDisabled}
        onClick={toggle}
        className="rounded-xs outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-1"
      >
        <CheckboxIndicator checked={displayState} className={indicatorClassName} innerClassName={indicatorInnerClassName} />
      </button>

      {label && <span className="text-[13px] font-medium text-text">{label}</span>}
    </label>
  )
}

// ── CheckboxTile ────────────────────────────────────────────────────
// A selectable Card — checkbox indicator + title/description, whole card
// is clickable. Use inside a CheckboxGroup for multi-select option pickers.

type CheckboxTileProps = CheckboxOwnProps & ResolvableProps & { description?: string; children?: ReactNode }

export function CheckboxTile({ label, description, disabled, className, indicatorClassName, indicatorInnerClassName, children, indeterminate, ...props }: CheckboxTileProps) {
  const { isChecked, isDisabled, toggle } = useResolvedCheckbox(props, disabled)
  const [, setIsFocused] = useState(false)
  const displayState: CheckState = indeterminate ? 'indeterminate' : isChecked

  return (
    <div
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : isChecked}
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
          isChecked || indeterminate ? 'border-primary bg-primary/5!' : 'border-border hover:border-border-hover',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {label && <p className="m-0 text-sm font-bold leading-snug text-text">{label}</p>}
            {description && <p className="m-0 mt-1 text-xs leading-normal text-text-muted">{description}</p>}
            {children}
          </div>
          <CheckboxIndicator checked={displayState} className={indicatorClassName} innerClassName={indicatorInnerClassName} />
        </div>
      </Card>
    </div>
  )
}