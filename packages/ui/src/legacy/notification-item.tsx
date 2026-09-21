// notification-item.tsx
import { type KeyboardEvent, type ReactNode } from 'react'
import { AlertTriangle, Bell, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { IconButton } from './icon-button'
import { cn } from 'cn'

export type NotificationVariant = 'default' | 'info' | 'success' | 'warning' | 'danger'

type NotificationAction = { label: string; onClick: () => void }

export type NotificationItemProps = {
  variant?: NotificationVariant
  icon?: ReactNode
  avatarSrc?: string
  title: ReactNode
  description?: ReactNode
  timestamp?: string
  read?: boolean
  actions?: NotificationAction[]
  onClick?: () => void
  href?: string
  onDismiss?: () => void
  className?: string
}

const VARIANT_ICON: Record<NotificationVariant, ReactNode> = {
  default: <Bell />, info: <Info />, success: <CheckCircle2 />, warning: <AlertTriangle />, danger: <XCircle />,
}
const VARIANT_CHIP: Record<NotificationVariant, string> = {
  default: 'bg-neutral-100 text-text-muted',
  info: 'bg-info-subtle text-info-subtle-foreground',
  success: 'bg-success-subtle text-success-subtle-foreground',
  warning: 'bg-warning-subtle text-warning-subtle-foreground',
  danger: 'bg-destructive-subtle text-destructive-subtle-foreground',
}

export function NotificationItem({
  variant = 'default', icon, avatarSrc, title, description, timestamp,
  read = true, actions, onClick, href, onDismiss, className,
}: NotificationItemProps) {
  const isInteractive = !!(onClick || href)
  const Wrapper = (href ? 'a' : 'div') as any

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      onClick?.()
    }
  }

  return (
    <Wrapper
      href={href}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      className={cn(
        'group relative flex w-full items-start gap-2.5 rounded-md  border-transparent p-2.5 text-start transition-colors',
        'hover:bg-neutral-100',
        isInteractive && 'cursor-pointer',
        !read && 'border-s-primary bg-neutral-100',
        className,
      )}
    >
      {avatarSrc ? (
        <img src={avatarSrc} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
      ) : (
        <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-sm [&>svg]:h-4 [&>svg]:w-4', VARIANT_CHIP[variant])}>
          {icon ?? VARIANT_ICON[variant]}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('m-0 line-clamp-1 text-[12px] leading-snug', read ? 'font-medium text-text' : 'font-semibold text-text')}>{title}</p>
          {onDismiss && (
            <IconButton
              icon={<X size={12} />}
              color="neutral"
              style="ghost"
              size="xs"
              aria-label="إخفاء الإشعار"
              className="opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDismiss() }}
            />
          )}
        </div>

        {description && <p className="m-0 mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-text-muted">{description}</p>}

        {(timestamp || (actions && actions.length > 0)) && (
          <div className="mt-1 flex items-center gap-3">
            {timestamp && <span className="text-[10px] text-text-faint">{timestamp}</span>}
            {actions?.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); action.onClick() }}
                className="text-[11px] font-semibold text-primary transition-colors hover:text-primary-hover"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </Wrapper>
  )
}