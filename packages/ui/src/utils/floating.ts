import { type Ref, useCallback, useLayoutEffect, useRef, useState } from 'react'

export type FloatingSide = 'top' | 'bottom' | 'left' | 'right'
export type FloatingAlign = 'start' | 'center' | 'end'
type Position = { top: number; left: number }

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function getFloatingPosition(
  anchorRect: DOMRect,
  floatingRect: DOMRect,
  side: FloatingSide,
  align: FloatingAlign,
  offset: number,
): Position {
  const padding = 8
  const maxTop = Math.max(padding, window.innerHeight - floatingRect.height - padding)
  const maxLeft = Math.max(padding, window.innerWidth - floatingRect.width - padding)
  let top: number
  let left: number

  if (side === 'top' || side === 'bottom') {
    top = side === 'bottom' ? anchorRect.bottom + offset : anchorRect.top - floatingRect.height - offset
    left =
      align === 'start' ? anchorRect.left
      : align === 'end' ? anchorRect.right - floatingRect.width
      : anchorRect.left + (anchorRect.width - floatingRect.width) / 2
  } else {
    left = side === 'right' ? anchorRect.right + offset : anchorRect.left - floatingRect.width - offset
    top =
      align === 'start' ? anchorRect.top
      : align === 'end' ? anchorRect.bottom - floatingRect.height
      : anchorRect.top + (anchorRect.height - floatingRect.height) / 2
  }

  return { top: clamp(top, padding, maxTop), left: clamp(left, padding, maxLeft) }
}

export function getFloatingAnimationOffset(side: FloatingSide) {
  if (side === 'top') return { y: 6 }
  if (side === 'bottom') return { y: -6 }
  if (side === 'left') return { x: 6 }
  return { x: -6 }
}

/** Shared by Popover and Tooltip — was previously hand-duplicated in
 *  both. Measures the anchor + floating element and keeps position in
 *  sync with scroll/resize while open. */
export function useFloatingPosition<TAnchor extends HTMLElement, TFloating extends HTMLElement>(
  open: boolean,
  side: FloatingSide,
  align: FloatingAlign,
  offset: number,
) {
  const anchorRef = useRef<TAnchor>(null)
  const floatingRef = useRef<TFloating>(null)
  const [position, setPosition] = useState<Position>({ top: -9999, left: -9999 })

  const updatePosition = useCallback(() => {
    if (!anchorRef.current || !floatingRef.current) return
    setPosition(
      getFloatingPosition(anchorRef.current.getBoundingClientRect(), floatingRef.current.getBoundingClientRect(), side, align, offset),
    )
  }, [align, offset, side])

  useLayoutEffect(() => {
    if (!open) return
    updatePosition() // measure before paint — avoids a flash at the old/zero position
    const frame = requestAnimationFrame(updatePosition)
    return () => cancelAnimationFrame(frame)
  }, [open, updatePosition])

  useLayoutEffect(() => {
    if (!open) return
    const handleChange = () => updatePosition()
    const resizeObserver = floatingRef.current ? new ResizeObserver(handleChange) : undefined
    resizeObserver?.observe(floatingRef.current as Element)
    window.addEventListener('resize', handleChange)
    window.addEventListener('scroll', handleChange, true)
    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', handleChange)
      window.removeEventListener('scroll', handleChange, true)
    }
  }, [open, updatePosition])

  return { anchorRef, floatingRef, position }
}

/** Combines multiple refs into one — needed because we now attach our
 *  own ref to the trigger element via cloneElement instead of wrapping
 *  it, and the trigger may already carry its own ref. */
export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue
      if (typeof ref === 'function') ref(node)
      else (ref as React.MutableRefObject<T | null>).current = node
    }
  }
}