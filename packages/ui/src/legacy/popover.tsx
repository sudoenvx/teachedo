// popover.tsx
import { AnimatePresence, motion } from 'motion/react'
import { cloneElement, isValidElement, type ReactElement, type ReactNode, useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from 'cn'
import { getFloatingAnimationOffset, mergeRefs, useFloatingPosition, type FloatingAlign, type FloatingSide } from '../utils/floating'

type PopoverTriggerType = 'click' | 'hover'

type PopoverProps = {
  /** A single ref-forwarding element (button, a, NavLink...). Handlers
   *  attach directly to it — it is NOT wrapped in another <button>,
   *  which previously produced invalid nested-button markup whenever
   *  the trigger was itself a button. */
  trigger: ReactElement
  children: ReactNode
  side?: FloatingSide
  align?: FloatingAlign
  offset?: number
  triggerType?: PopoverTriggerType
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  contentClassName?: string
  closeOnOutsideClick?: boolean
  closeOnEscape?: boolean
  hoverOpenDelay?: number
  hoverCloseDelay?: number
}

export function Popover({
  trigger,
  children,
  side = 'bottom',
  align = 'start',
  offset = 8,
  triggerType = 'click',
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  contentClassName,
  closeOnOutsideClick = true,
  closeOnEscape = true,
  hoverOpenDelay = 80,
  hoverCloseDelay = 140,
}: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen
  const contentId = useId()

  const openTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange],
  )

  const clearTimers = useCallback(() => {
    clearTimeout(openTimerRef.current)
    clearTimeout(closeTimerRef.current)
  }, [])

  const openWithDelay = useCallback(() => {
    clearTimers()
    if (hoverOpenDelay === 0) return setOpen(true)
    openTimerRef.current = setTimeout(() => setOpen(true), hoverOpenDelay)
  }, [clearTimers, hoverOpenDelay, setOpen])

  const closeWithDelay = useCallback(() => {
    clearTimers()
    if (hoverCloseDelay === 0) return setOpen(false)
    closeTimerRef.current = setTimeout(() => setOpen(false), hoverCloseDelay)
  }, [clearTimers, hoverCloseDelay, setOpen])

  const { anchorRef, floatingRef, position } = useFloatingPosition<HTMLElement, HTMLDivElement>(isOpen, side, align, offset)

  useEffect(() => {
    if (!isOpen || !closeOnOutsideClick) return
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (!anchorRef.current?.contains(target) && !floatingRef.current?.contains(target)) setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [anchorRef, floatingRef, closeOnOutsideClick, isOpen, setOpen])

  useEffect(() => {
    if (!isOpen || !closeOnEscape) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        anchorRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [anchorRef, closeOnEscape, isOpen, setOpen])

  useEffect(() => () => clearTimers(), [clearTimers])

  if (!isValidElement(trigger)) {
    throw new Error('Popover: `trigger` must be a single element that forwards its ref.')
  }

  const triggerProps: Record<string, unknown> = {
    ref: mergeRefs((trigger as any).ref, anchorRef),
    'aria-haspopup': 'dialog',
    'aria-expanded': isOpen,
    'aria-controls': isOpen ? contentId : undefined,
    'data-state': isOpen ? 'open' : 'closed',
  }

  if (triggerType === 'click') {
    triggerProps.onClick = (event: React.MouseEvent) => {
      ; (trigger.props as any).onClick?.(event)
      setOpen(!isOpen)
    }
  } else {
    // Focus/blur alongside pointer events — hover-only handlers make the
    // content unreachable for anyone navigating by keyboard.
    triggerProps.onPointerEnter = (event: React.PointerEvent) => {
      ; (trigger.props as any).onPointerEnter?.(event)
      if (event.pointerType !== 'touch') openWithDelay()
    }
    triggerProps.onPointerLeave = (event: React.PointerEvent) => {
      ; (trigger.props as any).onPointerLeave?.(event)
      if (event.pointerType !== 'touch') closeWithDelay()
    }
    triggerProps.onFocus = (event: React.FocusEvent) => {
      ; (trigger.props as any).onFocus?.(event)
      openWithDelay()
    }
    triggerProps.onBlur = (event: React.FocusEvent) => {
      ; (trigger.props as any).onBlur?.(event)
      closeWithDelay()
    }
  }

  const animationOffset = getFloatingAnimationOffset(side)

  return (
    <>
      {cloneElement(trigger, triggerProps)}

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={floatingRef}
              id={contentId}
              role="dialog"
              tabIndex={-1}
              initial={{ ...animationOffset, opacity: 0, scale: 0.98 }}
              animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              exit={{ ...animationOffset, opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 460, damping: 32, mass: 0.7 }}
              onPointerEnter={() => triggerType === 'hover' && (clearTimers(), openWithDelay())}
              onPointerLeave={() => triggerType === 'hover' && closeWithDelay()}
              style={{ top: position.top, left: position.left }}
              className={cn(
                'fixed z-60 max-h-[min(32rem,calc(100vh-1rem))] overflow-auto rounded-sm bg-surface shadow-elevated outline-none',
                contentClassName,
              )}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}