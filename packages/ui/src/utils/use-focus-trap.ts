// utils/use-focus-trap.ts
import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Moves focus into the container on activate, traps Tab/Shift+Tab within
 *  it, and restores focus to whatever was focused before on deactivate.
 *  Pass `initialFocusRef` to target a specific element (e.g. an input)
 *  instead of the first focusable element found. */
export function useFocusTrap(containerRef: RefObject<HTMLElement>, active: boolean, initialFocusRef?: RefObject<HTMLElement>) {
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active) return
    previouslyFocused.current = document.activeElement as HTMLElement

    const container = containerRef.current
    const target = initialFocusRef?.current ?? container?.querySelector<HTMLElement>(FOCUSABLE) ?? container
    // Deferred one frame so the entrance animation/portal has mounted
    // before we try to focus something inside it.
    const raf = requestAnimationFrame(() => target?.focus())

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !container) return
      const focusable = [...container.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null)
      if (focusable.length === 0) {
        event.preventDefault()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused.current?.focus?.()
    }
  }, [active, containerRef, initialFocusRef])
}