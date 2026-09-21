import React, { forwardRef, useId, useRef, useCallback, useEffect, useState } from 'react'
import { cn } from 'cn'
import { Language, useDetectedLanguage } from '@teachedo/utils/i18n'

export type InputVariant = 'neutral' | 'outline' | 'filled' | 'underline' | 'outstanding'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  hint?: string
  error?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: InputVariant
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
  containerClassName?: string
}

const SIZE_CLASSES = {
  sm: 'h-6.5 text-[12px] px-2',
  md: 'h-7.5 text-[12px] px-2',
  lg: 'h-8.5 text-[13px] px-2.5',
  xl: 'h-10 text-[14px] px-3',
}

const VARIANT_CLASSES: Record<InputVariant, string> = {
  outline: cn(
    'rounded-sm border border-input-border transition-colors',
    'focus-within:border-border-strong focus-within:bg-[#f0efec]',
  ),
  neutral: cn(
    'rounded-sm bg-neutral-100! transition-colors',
    'focus-within:bg-neutral-200/80',
  ),
  filled: cn(
    'rounded-sm border border-transparent bg-surface transition-colors',
    'focus-within:border-input-border-focus focus-within:bg-input-background',
  ),
  underline: cn(
    'rounded-none border-0 border-b-2 border-border bg-transparent px-0 transition-colors',
    'hover:border-border-strong',
    'focus-within:border-primary',
  ),
  outstanding: cn(
    'rounded-sm bg-input-background transition-colors',
    'border border-b-3 border-neutral-300',
    'focus-within:border-neutral-300 focus-within:border-b-neutral-500 focus-within:bg-input-focus',
    '[&_input]:placeholder:text-text-muted!',
  ),
}

const VARIANT_ERROR_CLASSES: Record<InputVariant, string> = {
  outline: 'border-danger focus-within:border-danger',
  filled: 'border-danger bg-danger-subtle focus-within:border-danger',
  underline: 'border-danger focus-within:border-danger',
  outstanding: 'border-danger focus-within:border-danger focus-within:border-b-danger',
  neutral: 'border-danger focus-within:border-danger',
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    size = 'md',
    variant = 'outline',
    leadingIcon,
    trailingIcon,
    className,
    containerClassName,
    id,
    disabled,
    type,
    value,
    defaultValue,
    placeholder,
    onChange,
    ...props
  },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const controlledValue = value === undefined ? undefined : String(value)
  const [uncontrolledValue, setUncontrolledValue] = useState(() => String(defaultValue ?? placeholder ?? ''))

  useEffect(() => {
    if (controlledValue !== undefined) setUncontrolledValue(controlledValue)
  }, [controlledValue])

  const detectedLanguage = useDetectedLanguage(controlledValue ?? uncontrolledValue)

  const internalRef = useRef<HTMLInputElement>(null)

  const setRefs = useCallback(
    (node: HTMLInputElement) => {
      internalRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node
    },
    [ref]
  )

  const handleContainerClick = () => {
    if (!disabled) document.getElementById(inputId)?.focus()
  }

  // const handleStep = (direction: 'up' | 'down') => {
  //   const input = internalRef.current
  //   if (!input || disabled) return

  //   if (direction === 'up') input.stepUp()
  //   else input.stepDown()

  //   const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
  //   nativeInputValueSetter?.call(input, input.value)
  //   input.dispatchEvent(new Event('input', { bubbles: true }))
  // }

  return (
    <div className={cn('flex flex-col gap-1', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className={
          cn(
            'text-[11px] font-medium w-fit',
            error ? 'text-danger' : 'text-text',
          )
        }>
          {label}
        </label>
      )}

      <div
        className={cn(
          "relative flex items-center gap-2 cursor-text bg-input-background",
          SIZE_CLASSES[size],
          VARIANT_CLASSES[variant],
          error && VARIANT_ERROR_CLASSES[variant],
          disabled && 'cursor-not-allowed bg-disabled-background opacity-70'
        )}
        onClick={handleContainerClick}
      >
        {leadingIcon && (
          <span className="flex shrink-0 items-center text-text-muted pointer-events-none">
            {leadingIcon}
          </span>
        )}

        <input
          id={inputId}
          ref={setRefs}
          disabled={disabled}
          type={type}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          onChange={(event) => {
            if (controlledValue === undefined) setUncontrolledValue(event.target.value)
            onChange?.(event)
          }}
          aria-invalid={!!error}
          className={cn(
            'w-full min-w-0 h-full outline-none text-text placeholder:text-text-muted placeholder:text-[11px] disabled:text-disabled-foreground disabled:cursor-not-allowed font-medium',
            type === 'number' && 'appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]',
            detectedLanguage === Language.English ? 'font-inter! placeholder:font-inter!' : 'font-tajawal! placeholder:font-tajawal!',
            className,
          )}
          {...props}
        />

        {/* أزرار التحكم الأفقية (تظهر فقط عند type="number") */}
        {/* {type === 'number' && !disabled && (
          <div className="flex shrink-0 items-center gap-0.5 ms-1">
            <IconButton
              icon={<Minus />}
              size="xs"
              color="secondary"
              style="ghost"
              aria-label="إنقاص"
              tabIndex={-1}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => handleStep('down')}
            />
            <IconButton
              icon={<Plus />}
              size="xs"
              color="secondary"
              style="ghost"
              aria-label="زيادة"
              tabIndex={-1}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => handleStep('up')}
            />
          </div>
        )} */}

        {trailingIcon && (
          <span className="flex shrink-0 items-center text-text-muted">
            {trailingIcon}
          </span>
        )}
      </div>

      {error ? (
        <p className="text-[11px] text-danger">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-text-muted">{hint}</p>
      ) : null}
    </div>
  )
})