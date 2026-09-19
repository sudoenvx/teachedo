// switch.tsx
import { useId } from 'react'
import { cn } from 'cn'

type SwitchSize = 'sm' | 'md'

const TRACK_SIZE: Record<SwitchSize, string> = { sm: 'w-7.5 h-4.5', md: 'w-9 h-5' }
const THUMB_SIZE: Record<SwitchSize, string> = { sm: 'w-3 h-3', md: 'w-3.5 h-3.5' }
const THUMB_TRAVEL: Record<SwitchSize, string> = { sm: 'translate-x-3', md: 'translate-x-4' }

/** Pure visual. No input, no label — shared so there is never more than
 *  one real interactive element per control. */
function SwitchIndicator({ checked, size = 'md' }: { checked: boolean; size?: SwitchSize }) {
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 rounded-xs transition-colors duration-150',
        'peer-focus-visible:ring-2 peer-focus-visible:ring-focus-ring peer-focus-visible:ring-offset-2',
        TRACK_SIZE[size],
        checked ? 'bg-primary' : 'bg-neutral-300',
      )}
    >
      <span
        data-state={checked ? 'checked' : 'unchecked'}
        className={cn(
          'pointer-events-none absolute top-[3px] left-[3px] rounded-xs bg-surface transition-transform duration-150',
          THUMB_SIZE[size],
          checked && THUMB_TRAVEL[size],
        )}
      />
    </span>
  )
}

type SwitchProps = {
  checked: boolean
  onCheckedChange: (v: boolean) => void
  size?: SwitchSize
  disabled?: boolean
  className?: string
  'aria-label'?: string
}

export function Switch({ checked, onCheckedChange, size = 'md', disabled, className, 'aria-label': ariaLabel }: SwitchProps) {
  const id = useId()
  return (
    <label
      htmlFor={id}
      className={cn('relative inline-flex items-center cursor-pointer select-none', disabled && 'pointer-events-none opacity-45', className)}
    >
      <input
        id={id}
        type="checkbox"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
      />
      <SwitchIndicator checked={checked} size={size} />
    </label>
  )
}

type SwitchTileProps = {
  checked: boolean
  onCheckedChange: (v: boolean) => void
  label: string
  description?: string
  size?: SwitchSize
  disabled?: boolean
  className?: string
}

export function SwitchTile({ checked, onCheckedChange, label, description, size = 'sm', disabled, className }: SwitchTileProps) {
  const id = useId()
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex cursor-pointer select-none items-center justify-between gap-3 rounded-sm bg-surface p-2 transition-colors duration-150',
        checked ? 'bg-primary-subtle' : 'bg-neutral-100 hover:bg-neutral-200/80',
        disabled && 'pointer-events-none opacity-45',
        className,
      )}
    >
      <span className="flex flex-col gap-0.5">
        <span className="text-[12px] font-semibold leading-tight text-text">{label}</span>
        {description && <span className="max-w-sm text-[11px] leading-snug text-text-muted">{description}</span>}
      </span>

      {/* sr-only, not opacity-0+absolute: the whole tile is already the
          click target, so the input only needs to stay in the tab order. */}
      <input
        id={id}
        type="checkbox"
        role="switch"
        aria-checked={checked}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="peer sr-only"
      />
      <SwitchIndicator checked={checked} size={size} />
    </label>
  )
}