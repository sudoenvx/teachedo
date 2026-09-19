// components/ui/base-modal.tsx
import { useEffect, useRef, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, type Transition, type Variants } from 'motion/react'
import { useHotkey } from '@tanstack/react-hotkeys' // ⚠️ adjust to your package's actual export/signature if it differs
import { cn } from 'cn'
import { lockScroll, unlockScroll, useFocusTrap } from '../utils'

export type ModalSize = 'sm' | 'md' | 'lg'

export type BaseModalProps = {
  open: boolean
  onClose: () => void
  children: ReactNode
  size?: ModalSize
  closeOnOverlay?: boolean
  isFullScreen?: boolean
  initialFocusRef?: RefObject<HTMLElement>
  className?: string
}

export const modalSizeMap: Record<ModalSize, string> = {
  sm: 'w-[380px]',
  md: 'w-[480px]',
  lg: 'w-[600px]',
}

const transition: Transition = { duration: 0.25, ease: [0.4, 0, 0.2, 1] }

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition },
  exit: { opacity: 0, transition: { ...transition, duration: 0.15 } },
}

// Real motion this time: scale + rise on entrance, matching the spring
// feel used across Popover/Tooltip elsewhere in the system.
const panelVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition },
  exit: { opacity: 0, scale: 0.98, y: 4, transition: { ...transition, duration: 0.15 } },
}

const fullScreenVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition },
  exit: { opacity: 0, transition: { ...transition, duration: 0.15 } },
}

export function BaseModal({
  open,
  onClose,
  children,
  size = 'md',
  closeOnOverlay = false,
  isFullScreen = false,
  initialFocusRef,
  className,
}: BaseModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useHotkey('Escape', () => onClose())
  useFocusTrap(panelRef as RefObject<HTMLDivElement>, open, initialFocusRef)

  useEffect(() => {
    if (!open) return
    lockScroll()
    return () => unlockScroll()
  }, [open])

  return createPortal(
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          // z-55 sits deliberately between app chrome (sidebar/navbar,
          // 40–50) and floating layers (Popover 60, Tooltip 70) — so a
          // dropdown or tooltip opened from *inside* a modal still
          // renders above it, instead of being trapped underneath.
          className="fixed inset-0 z-55 flex items-center justify-center bg-overlay p-4"
        >
          <div data-overlay className="absolute inset-0" aria-hidden="true" onClick={() => closeOnOverlay && onClose()} />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            variants={isFullScreen ? fullScreenVariants : panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'relative flex flex-col overflow-hidden bg-surface outline-none',
              isFullScreen
                ? 'h-full w-full rounded-none'
                : cn('max-h-[calc(100vh-48px)] max-w-[calc(100vw-32px)] rounded-sm', modalSizeMap[size]),
              className,
            )}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}