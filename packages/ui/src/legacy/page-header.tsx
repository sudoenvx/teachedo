import type { ReactNode } from 'react'
import { Card } from './card'
import { Body, Title } from './typography'

type PageHeaderProps = {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  className?: string
}

export function PageHeader({ title, description, actions, className = '' }: PageHeaderProps) {
  return (
    <Card className={`flex flex-col gap-2 bg-transparent p-2 shadow-none  ${className}`} bodyClassName="p-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Title size='small' className="font-bold tracking-tight text-text">{title}</Title>
          {description && <Body className="text-text-muted">{description}</Body>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </Card>
  )
}

export type { PageHeaderProps }
