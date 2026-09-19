// search-input.tsx
import { forwardRef, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search, X } from 'lucide-react'
import { IconButton } from './icon-button'
import { cn } from 'cn'
import { Language, useDetectedLanguage } from '@teachedo/utils/i18n'

export type SearchInputVariant = 'neutral' | 'outline' | 'filled' | 'underline' | 'outstanding'
export type SearchInputSize = 'sm' | 'md' | 'lg'
export type SearchInputMode = 'expanded' | 'compact'

export interface SearchInputProps {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  /** Fired on Enter, separate from onChange — for consumers who want to
   *  query on submit rather than on every keystroke. */
  onSearch?: (value: string) => void
  placeholder?: string
  size?: SearchInputSize
  variant?: SearchInputVariant
  /** 'expanded' = always a full field (e.g. inside a toolbar with room
   *  to spare). 'compact' = starts as an icon button and expands on
   *  click — for tight header/table-action spaces. */
  mode?: SearchInputMode
  /** Width the field animates to when in compact mode, once opened. */
  expandedWidth?: number | string
  disabled?: boolean
  autoFocus?: boolean
  className?: string
  containerClassName?: string
}

const HEIGHT_CLASSES: Record<SearchInputSize, string> = {
  sm: 'h-6.5', md: 'h-6.5', lg: 'h-8.5',
}
const TEXT_CLASSES: Record<SearchInputSize, string> = {
  sm: 'text-[12px]', md: 'text-[12px]', lg: 'text-[13px]',
}
const ICON_BUTTON_SIZE: Record<SearchInputSize, 'xs' | 'sm' | 'md' | 'lg'> = {
  sm: 'sm', md: 'md', lg: 'lg'
}

const VARIANT_CLASSES: Record<SearchInputVariant, string> = {
  outline: cn('rounded-sm border border-input-border transition-colors', 'hover:border-input-border-hover', 'focus-within:border-input-border-focus'),
  neutral: cn('rounded-sm bg-neutral-100! transition-colors', 'focus-within:bg-neutral-200/80'),
  filled: cn('rounded-sm border border-transparent bg-surface transition-colors', 'focus-within:border-input-border-focus focus-within:bg-input-background'),
  underline: cn('rounded-none border-0 border-b-2 border-border bg-transparent px-0 transition-colors', 'hover:border-border-strong', 'focus-within:border-primary'),
  outstanding: cn('rounded-sm bg-input-background transition-colors', 'border border-b-3 border-border', 'focus-within:border-secondary/50 focus-within:border-b-secondary focus-within:bg-input-focus'),
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  {
    value,
    defaultValue,
    onChange,
    onSearch,
    placeholder = 'بحث...',
    size = 'md',
    variant = 'outline',
    mode = 'expanded',
    expandedWidth = 240,
    disabled,
    autoFocus,
    className,
    containerClassName,
  },
  ref,
) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')
  const currentValue = isControlled ? value! : internalValue
  const hasValue = currentValue.length > 0

  // Compact mode's own open/closed state — irrelevant when mode is
  // 'expanded' (always effectively "open").
  const [isOpen, setIsOpen] = useState(mode === 'expanded' || !!defaultValue)

  const detectedLanguage = useDetectedLanguage(currentValue)

  useEffect(() => {
    if (mode === 'compact' && isOpen) inputRef.current?.focus()
  }, [isOpen, mode])

  const setValue = (next: string) => {
    if (!isControlled) setInternalValue(next)
    onChange?.(next)
  }

  const handleClear = () => {
    setValue('')
    if (mode === 'compact') {
      setIsOpen(false)
    } else {
      inputRef.current?.focus()
    }
  }

  const handleBlur = () => {
    // Only auto-collapse when genuinely empty — never yank an active
    // query away from under the user.
    if (mode === 'compact' && !hasValue) setIsOpen(false)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') onSearch?.(currentValue)
    if (event.key === 'Escape') {
      if (hasValue) {
        setValue('')
      } else if (mode === 'compact') {
        setIsOpen(false)
        inputRef.current?.blur()
      }
    }
  }

  const setRefs = (node: HTMLInputElement | null) => {
    inputRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node
  }

  // ── Compact, collapsed: just the trigger icon button ──────────
  if (mode === 'compact' && !isOpen) {
    return (
      <IconButton
        icon={<Search />}
        color="neutral"
        style="tint"
        size={ICON_BUTTON_SIZE[size]}
        aria-label="بحث"
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        className={containerClassName}
      />
    )
  }

  const field = (
    <div
      className={cn(
        'relative flex items-center gap-2 bg-input-background px-2',
        HEIGHT_CLASSES[size],
        VARIANT_CLASSES[variant],
        disabled && 'cursor-not-allowed bg-disabled-background opacity-70',
      )}
    >
      <span className="flex shrink-0 items-center text-text-muted [&>svg]:h-3.5 [&>svg]:w-3.5">
        <Search />
      </span>

      <input
        id={inputId}
        ref={setRefs}
        type="text"
        role="searchbox"
        disabled={disabled}
        autoFocus={autoFocus || (mode === 'compact' && isOpen)}
        value={currentValue}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          'h-full w-full min-w-0 outline-none text-text placeholder:text-text-muted placeholder:text-[11px] disabled:cursor-not-allowed',
          TEXT_CLASSES[size],
          detectedLanguage === Language.English ? 'font-inter! placeholder:font-inter!' : 'font-tajawal! placeholder:font-tajawal!',
          className,
        )}
      />

      <AnimatePresence>
        {hasValue && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.12 }}
          >
            <IconButton
              icon={<X size={12} />}
              color="neutral"
              style="ghost"
              size="xs"
              aria-label="مسح البحث"
              tabIndex={-1}
              onPointerDown={(e) => e.preventDefault()} // don't steal focus from the input before onClick fires
              onClick={handleClear}
            />
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )

  if (mode === 'expanded') {
    return <div className={cn('w-full', containerClassName)}>{field}</div>
  }

  // ── Compact, open: animate width growing out of the trigger's slot ──
  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: expandedWidth, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.7 }}
      className={cn('overflow-hidden', containerClassName)}
    >
      {field}
    </motion.div>
  )
})