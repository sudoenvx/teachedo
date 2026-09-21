// card.tsx
import { type KeyboardEvent, type ReactNode } from 'react'
import { Title } from './typography'
import { cn } from 'cn'

type CardVariant = 'flat' | 'framed'

export interface CardProps {
  title?: ReactNode
  description?: string
  headerActions?: ReactNode
  headerClassName?: string
  footer?: ReactNode
  footerClassName?: string
  children: ReactNode
  className?: string
  bodyClassName?: string
  onClick?: () => void
  /** Adds shadow-card elevation. Off by default — flat sits directly on
   *  the page, matching the borderless/shadowless look used elsewhere. */
  elevated?: boolean
  /** 'flat' = plain surface card (previous `Card`).
   *  'framed' = padded outer frame around the content, like a window
   *  chrome (previous `WindowCard`). */
  variant?: CardVariant
}

function CardHeader({
  title,
  description,
  headerActions,
  headerClassName,
  variant,
}: Pick<CardProps, 'title' | 'description' | 'headerActions' | 'headerClassName'> & {
  variant: CardVariant
}) {
  if (!title && !description && !headerActions) return null
  return (
    <header
      className={cn(
        'flex items-center justify-between gap-4 ',
        variant === 'flat' ? ' px-2 py-1.5 border-b border-border text-primary-hover mb-1' : 'mb-2.5',
        headerClassName
      )}
    >
      {(title || description) && (
        <div className="min-w-0 flex-1">
          {title && (
            <Title
              className={cn(
                'm-0 truncate font-medium leading-snug',
                variant === 'flat'
                  ? 'text-[12px] '
                  : 'text-[12px] text-secondary-foreground'
              )}
            >
              {title}
            </Title>
          )}
          {description && (
            <p className="m-0 mt-0.5 truncate text-[11px] leading-tight text-surface/70">
              {description}
            </p>
          )}
        </div>
      )}
      {headerActions && <div className="flex shrink-0 items-center gap-1.5">{headerActions}</div>}
    </header>
  )
}

function CardFooter({ footer, footerClassName }: Pick<CardProps, 'footer' | 'footerClassName'>) {
  if (!footer) return null
  return (
    <footer
      className={cn(
        'flex items-center justify-end gap-2 bg-surface-secondary p-2.5',
        footerClassName
      )}
    >
      {footer}
    </footer>
  )
}

export function Card({
  title,
  description,
  headerActions,
  headerClassName,
  footer,
  footerClassName,
  children,
  className,
  bodyClassName,
  onClick,
  elevated = true,
  variant = 'flat',
}: CardProps) {
  const isInteractive = !!onClick

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isInteractive) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick!()
    }
  }

  const interactiveProps = isInteractive
    ? {
      role: 'button' as const,
      tabIndex: 0,
      onClick,
      onKeyDown: handleKeyDown,
      className: cn(
        'cursor-pointer transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-1'
      ),
    }
    : {}

  const content = (
    <div
      {...(variant === 'flat' ? interactiveProps : {})}
      className={cn(
        'w-full overflow-hidden rounded-lg! border border-border bg-surface',
        // 'border border-border',
        variant === 'flat' && elevated && 'shadow-none',
        variant === 'flat' && interactiveProps.className,
        variant === 'flat' && className
      )}
    >
      <CardHeader
        title={title}
        description={description}
        headerActions={headerActions}
        headerClassName={headerClassName}
        variant={variant}
      />
      <section className={cn('text-sm leading-relaxed text-text p-5!', bodyClassName)}>
        {children}
      </section>
      {variant === 'flat' && <CardFooter footer={footer} footerClassName={footerClassName} />}
    </div>
  )

  if (variant === 'flat') return content

  // 'framed': the whole frame (header + content pane) is one click/focus
  // target — no dead zone between header and body.
  return (
    <div
      {...interactiveProps}
      className={cn(
        'rounded-sm bg-secondary p-1.5',
        elevated && 'shadow-card',
        interactiveProps.className,
        className
      )}
    >
      <CardHeader
        title={title}
        description={description}
        headerActions={headerActions}
        headerClassName={headerClassName}
        variant={variant}
      />
      <div className="overflow-hidden rounded-sm bg-surface">
        <section className={cn('text-sm leading-relaxed text-text', bodyClassName ?? 'p-3')}>
          {children}
        </section>
        <CardFooter footer={footer} footerClassName={footerClassName} />
      </div>
    </div>
  )
}