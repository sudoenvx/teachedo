// breadcrumb.tsx
import { type ReactNode, useState, useEffect, forwardRef, Fragment } from 'react'
import { ChevronLeft, MoreHorizontal, Home } from 'lucide-react'
import { DropdownMenu, DropdownMenuItem } from './dropdown-menu'
import { cn } from 'cn'

export type BreadcrumbItem = {
  label: ReactNode
  href?: string
  icon?: ReactNode
  onClick?: () => void
  /** If true, the label is visually hidden (useful for icon-only crumbs like Home) */
  hideLabel?: boolean
}

export type BreadcrumbBuilderProps = {
  item: BreadcrumbItem
  isCurrent: boolean
  isVisible: boolean
  children: ReactNode
}

type BreadcrumbProps = {
  items: BreadcrumbItem[]
  /** RTL-first default, matching the rest of your UI. */
  separator?: ReactNode
  /** Collapse to first + ellipsis + last N once item count exceeds this. */
  maxVisible?: number
  /** Automatically prepend a Home crumb at the beginning (defaults to true) */
  showHome?: boolean
  /** Builder function to override or wrap the default crumb behavior */
  builder?: (props: BreadcrumbBuilderProps) => ReactNode
  className?: string
}

// 1. استخدام forwardRef ضروري جداً لكي يعمل الـ Crumb كـ Trigger لـ DropdownMenu
const Crumb = forwardRef<HTMLElement, { item: BreadcrumbItem; isCurrent: boolean }>(
  ({ item, isCurrent }, ref) => {
    const content = (
      <span className="flex items-center gap-1.5">
        {item.icon && (
          <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center [&>svg]:h-full [&>svg]:w-full">
            {item.icon}
          </span>
        )}
        <span className={cn(item.hideLabel ? 'sr-only' : 'truncate', 'text-[13px]')}>
          {item.label}
        </span>
      </span>
    )

    if (isCurrent || (!item.href && !item.onClick)) {
      return (
        <span
          ref={ref as React.Ref<HTMLSpanElement>}
          aria-current={isCurrent ? 'page' : undefined}
          className={cn(
            'max-w-40 truncate text-[12px]',
            isCurrent ? 'font-semibold text-primary-hover' : 'text-text-muted',
          )}
        >
          {content}
        </span>
      )
    }

    const sharedClass =
      'max-w-40 truncate text-[12px] text-text-muted transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-1 rounded-xs'

    if (item.href) {
      return (
        <a ref={ref as React.Ref<HTMLAnchorElement>} href={item.href} className={sharedClass}>
          {content}
        </a>
      )
    }

    return (
      <button ref={ref as React.Ref<HTMLButtonElement>} type="button" onClick={item.onClick} className={sharedClass}>
        {content}
      </button>
    )
  }
)
Crumb.displayName = 'Crumb'

export function Breadcrumb({
  items,
  separator,
  maxVisible = 4,
  showHome = true,
  builder,
  className
}: BreadcrumbProps) {
  const [isMobile, setIsMobile] = useState(false)

  // Listen for small screen sizes to reduce visible items dynamically
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 640px)')
    setIsMobile(mql.matches)

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  // Resolve items (auto-inject Home if needed)
  const firstIsHome = items[0]?.href === '/' || items[0]?.label === 'الرئيسية'
  const resolvedItems = (showHome && !firstIsHome)
    ? [
      { label: 'الرئيسية', href: '/', icon: <Home /> },
      ...items
    ]
    : items

  const effectiveMaxVisible = isMobile ? 2 : maxVisible
  const sep = separator ?? <ChevronLeft className="h-3 w-3 text-text-muted" aria-hidden="true" />
  const lastIndex = resolvedItems.length - 1

  const shouldCollapse = resolvedItems.length > effectiveMaxVisible && effectiveMaxVisible >= 2
  const tailCount = Math.max(effectiveMaxVisible - 1, 1)

  const visible = shouldCollapse
    ? [resolvedItems[0], null, ...resolvedItems.slice(resolvedItems.length - tailCount)]
    : resolvedItems

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center', className)}>
      <ol className="flex items-center gap-1.5">
        {visible.map((item, i) => {

          // Render Hidden Items (Ellipsis Dropdown)
          if (item === null) {
            const hidden = resolvedItems.slice(1, resolvedItems.length - tailCount)
            return (
              <li key="ellipsis" className="flex items-center gap-1.5">
                <DropdownMenu
                  trigger={
                    <button
                      type="button"
                      aria-label="عرض باقي المسار"
                      className="flex h-5 w-5 items-center justify-center rounded-xs text-text-muted transition-colors hover:bg-neutral-100 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-1"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </button>
                  }
                  align="start"
                >
                  {hidden.map((hiddenItem, j) => {
                    const defaultHiddenCrumb = (
                      <DropdownMenuItem
                        icon={hiddenItem.icon}
                        onSelect={() => {
                          // hiddenItem?.onClick?.()
                          if (hiddenItem.href) window.location.href = hiddenItem.href
                        }}
                      >
                        {hiddenItem.label}
                      </DropdownMenuItem>
                    )

                    return (
                      <Fragment key={j}>
                        {builder
                          ? builder({ item: hiddenItem, isCurrent: false, isVisible: false, children: defaultHiddenCrumb })
                          : defaultHiddenCrumb}
                      </Fragment>
                    )
                  })}
                </DropdownMenu>
                <span aria-hidden="true">{sep}</span>
              </li>
            )
          }

          // Render Visible Items
          const originalIndex = shouldCollapse ? (i === 0 ? 0 : lastIndex - (visible.length - 1 - i)) : i
          const isCurrent = originalIndex === lastIndex

          const defaultCrumb = <Crumb item={item} isCurrent={isCurrent} />
          const customCrumb = builder
            ? builder({ item, isCurrent, isVisible: true, children: defaultCrumb })
            : defaultCrumb

          return (
            <li key={originalIndex} className="flex items-center gap-1.5">
              {customCrumb}
              {!isCurrent && <span aria-hidden="true">{sep}</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}