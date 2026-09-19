// components/ui/section-card.tsx — small shared piece so every section
// header (icon chip + title + subtitle) looks identical across the app,
// instead of being hand-rebuilt slightly differently per page.
import { type ReactNode } from 'react'
import { cn } from 'cn'

type SectionCardProps = {
  icon?: ReactNode
  iconColor?: 'primary' | 'accent' | 'success' | 'danger'
  title?: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

const ICON_CHIP_CLASSES = {
  primary: 'bg-primary-subtle text-primary-subtle-foreground',
  accent: 'bg-accent-subtle text-accent-subtle-foreground',
  success: 'bg-success-subtle text-success-subtle-foreground',
  danger: 'bg-destructive-subtle text-destructive-subtle-foreground',
}

export function SectionCard({ icon, iconColor = 'primary', title, description, action, children, className }: SectionCardProps) {
  return (
    <section className={cn('rounded-sm bg-surface p-2', className)}>
      {
        title || description || action && (
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {
                icon && (
                  <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-sm [&>svg]:h-4 [&>svg]:w-4', ICON_CHIP_CLASSES[iconColor])}>
                    {icon}
                  </span>
                )
              }
              <div>
                {
                  title && <h2 className="m-0 text-[13px] font-bold text-text">{title}</h2>
                }
                {description && <p className="m-0 mt-0.5 text-[11px] text-text-muted">{description}</p>}
              </div>
            </div>
            {action}
          </div>
        )
      }
      {children}
    </section>
  )
}