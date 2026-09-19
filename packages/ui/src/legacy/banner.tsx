// banner.tsx
import { type ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { Button } from './button'
import { IconButton } from './icon-button'
import { cn } from 'cn'

export type BannerVariant = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

type BannerAction = {
  label: string
  onClick: () => void
  style?: 'solid' | 'tint' | 'outline' | 'ghost'
}

export type BannerProps = {
  variant?: BannerVariant
  /** Pass `false` to hide the icon slot entirely. */
  icon?: ReactNode | false
  title?: ReactNode
  description?: ReactNode
  children?: ReactNode
  actions?: BannerAction[]
  dismissible?: boolean
  onDismiss?: () => void
  /** 'inline' keeps actions on the content row (wide banners);
   *  'stacked' drops them to their own row (narrow/mobile). */
  actionsLayout?: 'inline' | 'stacked'
  className?: string
}

const VARIANT_ICON: Record<BannerVariant, ReactNode> = {
  neutral: <Info />, info: <Info />, success: <CheckCircle2 />, warning: <AlertTriangle />, danger: <XCircle />,
}

const VARIANT_STYLES: Record<BannerVariant, { bg: string; fg: string; chip: string }> = {
  neutral: { bg: 'bg-neutral-100', fg: 'text-text', chip: 'bg-neutral-200 text-text-muted' },
  info: { bg: 'bg-info-subtle', fg: 'text-info-subtle-foreground', chip: 'bg-info/15 text-info' },
  success: { bg: 'bg-success-subtle', fg: 'text-success-subtle-foreground', chip: 'bg-success/15 text-success' },
  warning: { bg: 'bg-warning-subtle', fg: 'text-warning-subtle-foreground', chip: 'bg-warning/20 text-warning' },
  danger: { bg: 'bg-destructive-subtle', fg: 'text-destructive-subtle-foreground', chip: 'bg-destructive/15 text-destructive' },
}

export function Banner({
  variant = 'info', icon, title, description, children, actions,
  dismissible = false, onDismiss, actionsLayout = 'inline', className,
}: BannerProps) {
  const styles = VARIANT_STYLES[variant]
  const resolvedIcon = icon === false ? null : (icon ?? VARIANT_ICON[variant])
  const buttonColor = variant === 'neutral' ? 'neutral' : variant

  return (
    <div
      role={variant === 'danger' || variant === 'warning' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-sm p-3', styles.bg, className)}
    >
      {resolvedIcon && (
        <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-sm [&>svg]:h-4 [&>svg]:w-4', styles.chip)}>
          {resolvedIcon}
        </span>
      )}

      <div className={cn('flex min-w-0 flex-1 flex-wrap items-start gap-3', actionsLayout === 'stacked' && 'flex-col')}>
        <div className="min-w-0 flex-1">
          {title && <p className={cn('m-0 text-[12px] font-semibold leading-snug', styles.fg)}>{title}</p>}
          {(description || children) && (
            <div className={cn('text-[11px] leading-snug opacity-90', styles.fg, title && 'mt-0.5')}>{description ?? children}</div>
          )}
        </div>

        {actions && actions.length > 0 && (
          <div className={cn('flex shrink-0 items-center gap-2', actionsLayout === 'stacked' && 'mt-1')}>
            {actions.map((action) => (
              <Button key={action.label} type="button" size="xs" color={buttonColor} style={action.style ?? 'ghost'} onClick={action.onClick}>
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {dismissible && (
        <IconButton icon={<X size={13} />} color="neutral" style="ghost" size="xs" aria-label="إغلاق" className="shrink-0" onClick={onDismiss} />
      )}
    </div>
  )
}