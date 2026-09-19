import React, { forwardRef, useId } from 'react'
import { cn } from 'cn'

export type TextareaVariant = 'outline' | 'filled' | 'underline' | 'outstanding'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
  /** 'surface' = bottom-border card look, sits nicely on an off-white page bg (e.g. #edecea).
   *  'outline' = full border, reads better directly on a white surface (cards, modals, white panels). */
  variant?: TextareaVariant
  /** Disable manual resize handle (resize stays vertical by default) */
  resizable?: boolean
  containerClassName?: string
}


const VARIANT_CLASSES: Record<TextareaVariant, string> = {
  outline: cn(
    'rounded-sm border border-input-border bg-input-background',
    'hover:border-input-border-hover',
    'focus:border-input-border-focus',
  ),
  filled: cn(
    'rounded-sm border border-transparent bg-surface-secondary',
    'hover:bg-surface-secondary/70',
    'focus:border-input-border-focus focus:bg-input-background',
  ),
  underline: cn(
    'rounded-none border-0 border-b-2 border-border bg-transparent px-0',
    'hover:border-border-strong',
    'focus:border-primary',
  ),

  outstanding: cn(
    'rounded-[4px] bg-input-background',
    'border border-b-3 border-border',
    'focus:border-secondary/50 focus:border-b-secondary focus:bg-input-focus',
    'placeholder:text-text-muted!',
  ),
}

const VARIANT_ERROR_CLASSES: Record<TextareaVariant, string> = {
  outline: 'border-destructive bg-destructive-subtle focus:border-destructive',
  filled: 'border-destructive bg-destructive-subtle focus:border-destructive',
  underline: 'border-destructive focus:border-destructive',
  outstanding: 'border-destructive focus:border-destructive focus:border-b-destructive',
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    label,
    hint,
    error,
    variant = 'outline',
    resizable = false,
    className,
    containerClassName,
    id,
    disabled,
    rows = 4,
    ...props
  },
  ref,
) {
  const generatedId = useId()
  const textareaId = id ?? generatedId

  return (
    <div className={cn('flex flex-col gap-1', containerClassName)}>
      {label && (
        <label htmlFor={textareaId} className="text-[11px] font-medium text-text w-fit">
          {label}
        </label>
      )}

      <textarea
        id={textareaId}
        ref={ref}
        disabled={disabled}
        rows={rows}
        aria-invalid={!!error}
        className={cn(
          'w-full text-text placeholder:text-text-muted transition-colors outline-none',
          'text-[12px] px-1.5 py-1.5 leading-relaxed',
          'placeholder:text-muted!',
          VARIANT_CLASSES[variant],
          resizable ? 'resize-y' : 'resize-none',
          error && VARIANT_ERROR_CLASSES[variant],
          disabled && 'opacity-50 cursor-not-allowed bg-secondary/10',
          className,
        )}
        {...props}
      />

      {error ? (
        <p className="text-[11px] text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-text-muted">{hint}</p>
      ) : null}
    </div>
  )
})