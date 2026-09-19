// field-trigger.tsx
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from 'cn'

type FieldTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
  placeholder?: string
  hasValue: boolean
  error?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLASSES = { sm: 'h-6.5 text-[12px] px-2', md: 'h-7.5 text-[12px] px-2', lg: 'h-8.5 text-[13px] px-2.5' }

/** Same visual language as `Input`'s `outline` variant, so date/time
 *  pickers sit indistinguishably next to real inputs in a form. Pulled
 *  out once instead of copy-pasted into TimePicker/TimeRangePicker/
 *  DatePicker separately. */
export const FieldTrigger = forwardRef<HTMLButtonElement, FieldTriggerProps>(
  ({ leadingIcon, trailingIcon, placeholder, hasValue, error, size = 'md', disabled, className, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-2 rounded-[4px] border border-input-border bg-input-background text-start transition-colors',
        'hover:border-input-border-hover focus-visible:outline-none focus-visible:border-input-border-focus',
        'disabled:cursor-not-allowed disabled:bg-disabled-background disabled:text-disabled-foreground disabled:border-disabled-border',
        error && 'border-destructive',
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    >
      {leadingIcon && <span className="shrink-0 text-text-muted [&>svg]:h-3.5 [&>svg]:w-3.5">{leadingIcon}</span>}
      <span className={cn('flex-1 truncate', hasValue ? 'text-text' : 'text-text-muted')}>{children ?? placeholder}</span>
      {trailingIcon && <span className="shrink-0 text-text-muted [&>svg]:h-3.5 [&>svg]:w-3.5">{trailingIcon}</span>}
    </button>
  ),
)
FieldTrigger.displayName = 'FieldTrigger'