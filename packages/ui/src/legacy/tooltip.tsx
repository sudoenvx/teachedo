// tooltip.tsx
import { AnimatePresence, motion } from 'motion/react'
import { cloneElement, isValidElement, type ReactElement, type ReactNode, useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from 'cn'
import { getFloatingAnimationOffset, mergeRefs, useFloatingPosition, type FloatingAlign, type FloatingSide } from '../utils/floating'

type TooltipProps = {
  content: ReactNode
  /** A single ref-forwarding element to attach the hover/focus listeners to. */
  children: ReactElement
  side?: FloatingSide
  align?: FloatingAlign
  offset?: number
  delay?: number
  disabled?: boolean
  contentClassName?: string
}

export function Tooltip({
  content,
  children,
  side = 'top',
  align = 'center',
  offset = 6,
  delay = 300,
  disabled = false,
  contentClassName,
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const tooltipId = useId()
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const { anchorRef, floatingRef, position } = useFloatingPosition<HTMLElement, HTMLDivElement>(isOpen, side, align, offset)

  const show = useCallback(() => {
    if (disabled || !content) return
    clearTimeout(openTimerRef.current)
    openTimerRef.current = setTimeout(() => setIsOpen(true), delay)
  }, [content, delay, disabled])

  const hide = useCallback(() => {
    clearTimeout(openTimerRef.current)
    setIsOpen(false)
  }, [])

  useEffect(() => () => clearTimeout(openTimerRef.current), [])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && hide()
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [hide, isOpen])

  if (!isValidElement(children)) {
    throw new Error('Tooltip: `children` must be a single element that forwards its ref.')
  }

  const animationOffset = getFloatingAnimationOffset(side)

  return (
    <>
      {cloneElement(children, {
        ref: mergeRefs((children as any).ref, anchorRef),
        'aria-describedby': isOpen ? tooltipId : undefined,
        onPointerEnter: (event: React.PointerEvent) => {
          ; (children.props as any).onPointerEnter?.(event)
          if (event.pointerType !== 'touch') show()
        },
        onPointerLeave: (event: React.PointerEvent) => {
          ; (children.props as any).onPointerLeave?.(event)
          if (event.pointerType !== 'touch') hide()
        },
        onFocus: (event: React.FocusEvent) => {
          ; (children.props as any).onFocus?.(event)
          show()
        },
        onBlur: (event: React.FocusEvent) => {
          ; (children.props as any).onBlur?.(event)
          hide()
        },
      } as any)}

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={floatingRef}
              id={tooltipId}
              role="tooltip"
              // Tooltips are non-interactive by spec — the trigger's own
              // hover/focus fully controls visibility, so the tooltip
              // should never intercept pointer events itself.
              className={cn(
                'pointer-events-none fixed z-70 max-w-64 rounded-sm bg-neutral-600 text-neutral-300 px-2 py-1',
                'text-[11px] font-medium leading-snug',
                contentClassName,
              )}
              initial={{ ...animationOffset, opacity: 0, scale: 0.96 }}
              animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              exit={{ ...animationOffset, opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 500, damping: 34, mass: 0.6 }}
              style={{ top: position.top, left: position.left }}
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}