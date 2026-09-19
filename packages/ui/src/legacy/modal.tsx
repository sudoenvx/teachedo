// components/ui/modal.tsx
import { type ReactNode } from 'react'
import { X } from 'lucide-react'
import { BaseModal, type ModalSize } from './base-modal'
import { IconButton } from './icon-button'
import { cn } from 'cn'

type ModalProps = {
  open: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: ModalSize
  closeOnOverlay?: boolean
  isFullScreen?: boolean
  hideCloseButton?: boolean
  bodyClassName?: string
  className?: string
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnOverlay = false,
  isFullScreen = false,
  hideCloseButton = false,
  bodyClassName,
  className,
}: ModalProps) {
  return (
    <BaseModal open={open} onClose={onClose} size={size} closeOnOverlay={closeOnOverlay} isFullScreen={isFullScreen} className={className}>
      {(title || !hideCloseButton) && (
        <div className="flex shrink-0 items-start justify-between gap-3 p-2 pb-2">
          <div className="flex flex-col gap-0.5">
            {title && <h2 className="m-0 text-[14px] font-bold text-text">{title}</h2>}
            {description && <p className="m-0 text-[12px] text-text-muted">{description}</p>}
          </div>
          {!hideCloseButton && (
            <IconButton icon={<X size={14} strokeWidth={2.5} />} color="neutral" style="ghost" size="sm" aria-label="إغلاق" onClick={onClose} />
          )}
        </div>
      )}

      <div className={cn('flex-1 overflow-y-auto px-2', title ? 'pb-2' : 'py-2', bodyClassName)}>{children}</div>

      {footer && <div className="flex shrink-0 items-center justify-end gap-2 p-2 pt-3">{footer}</div>}
    </BaseModal>
  )
}

export type { ModalProps }