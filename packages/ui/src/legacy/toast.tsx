import { AnimatePresence } from 'motion/react'
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { Check, Info, TriangleAlert, X } from 'lucide-react'
import { motion } from 'motion/react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

type ToastOptions = { duration?: number }
type ToastApi = {
  (message: string, type: ToastType, options?: ToastOptions): void
  success: (message: string, options?: ToastOptions) => void
  error: (message: string, options?: ToastOptions) => void
  info: (message: string, options?: ToastOptions) => void
  warning: (message: string, options?: ToastOptions) => void
}

const ToastContext = createContext<{ toast: ToastApi } | null>(null)

const toastStyles: Record<ToastType, { icon: ReactNode; className: string }> = {
  success: { icon: <Check size={15} />, className: 'bg-success-subtle text-success-subtle-foreground' },
  error: { icon: <TriangleAlert size={15} />, className: 'bg-destructive-subtle text-destructive-subtle-foreground' },
  info: { icon: <Info size={15} />, className: 'bg-info-subtle text-info-subtle-foreground' },
  warning: { icon: <TriangleAlert size={15} />, className: 'bg-warning-subtle text-warning-subtle-foreground' },
}

function ToastItem({ item, onDismiss }: { item: { id: number; message: string; type: ToastType; duration?: number }; onDismiss: (id: number) => void }) {
  const duration = item.duration ?? 3500
  const style = toastStyles[item.type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 24, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
      className="relative flex items-center gap-2 overflow-hidden rounded-sm border border-border-subtle bg-surface px-2.5 py-2 shadow-elevated"
      role="status"
      onAnimationEnd={() => {
        if (duration > 0) window.setTimeout(() => onDismiss(item.id), duration)
      }}
    >
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-sm ${style.className}`}>{style.icon}</span>
      <p className="min-w-0 flex-1 text-[12px] font-medium text-text">{item.message}</p>
      <button type="button" onClick={() => onDismiss(item.id)} className="shrink-0 rounded-xs p-1 text-text-muted transition-colors hover:bg-neutral-100 hover:text-text" aria-label="إغلاق">
        <X size={13} />
      </button>
      <motion.span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" initial={{ scaleX: 1, transformOrigin: 'right' }} animate={{ scaleX: 0 }} transition={{ duration: duration / 1000, ease: 'linear' }} />
    </motion.div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<
    Array<{ id: number; message: string; type: ToastType; duration?: number }>
  >([])
  const dismiss = useCallback(
    (id: number) => setItems((current) => current.filter((item) => item.id !== id)),
    []
  )
  const add = useCallback((message: string, type: ToastType, options?: ToastOptions) => {
    setItems((current) => [
      ...current,
      { id: Date.now() + Math.random(), message, type, duration: options?.duration },
    ])
  }, [])
  const toast = useMemo(() => {
    const api = ((message: string, type: ToastType, options?: ToastOptions) =>
      add(message, type, options)) as ToastApi
    api.success = (message, options) => add(message, 'success', options)
    api.error = (message, options) => add(message, 'error', options)
    api.info = (message, options) => add(message, 'info', options)
    api.warning = (message, options) => add(message, 'warning', options)
    return api
  }, [add])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="pointer-events-none fixed bottom-5 right-5 z-100 flex w-[min(24rem,calc(100vw-2.5rem))] flex-col gap-2"
        dir="rtl"
      >
        <AnimatePresence initial={false}>
          {items.map((item) => <ToastItem key={item.id} item={item} onDismiss={dismiss} />)}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context.toast
}
