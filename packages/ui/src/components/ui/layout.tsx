import {
  Children,
  Fragment,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ComponentType,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'
import { NavLink, matchPath, useLocation } from 'react-router-dom'
import {
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react'
import { DirectionProvider } from '@base-ui/react'
import { cn } from 'cn'
import { getDocumentDirection, LayoutProvider, useLayout, type LayoutProviderProps } from './layout-state'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'
import { Popover, PopoverContent, PopoverTrigger } from './popover'


/* ==========================================================================
   Anatomy

   <Layout>                          root: state, direction, tooltips, canvas
     <LayoutSidebar>                 the column (desktop) / drawer (mobile)
       <LayoutSidebarHeader />       slot: brand, tenant switcher, ...
       <LayoutSidebarContent>        slot: scrollable <nav>
         <LayoutSidebarSection>      optional titled group of items
           <LayoutSidebarItem />     link
           <LayoutSidebarSubmenu>    expandable group (flyout when compact)
             <LayoutSidebarSubItem />
       <LayoutSidebarFooter />       slot: user, upgrade card, ...
     <LayoutInset>                   everything to the side of the sidebar
       <LayoutHeader />              slot: sticky bar, put anything in it
       <LayoutContent />             <main>

   Also: <LayoutSidebarTrigger />, <LayoutIconButton />, useLayout()

   Nothing here renders notifications, user menus, logos or theme switchers.
   Those are yours to compose into the slots.

   Style hooks
   - Every part has a `data-slot="layout-*"` attribute.
   - <LayoutSidebar> is `group/sidebar` and sets data-state="expanded|compact",
     so any descendant can react in pure CSS:
       group-data-[state=compact]/sidebar:hidden
   - Sizes are CSS variables on <Layout>: --layout-sidebar-width (16rem),
     --layout-sidebar-width-icon (3rem). Override them via `style`/`className`.
   ========================================================================== */

export type LayoutIcon = ComponentType<{ className?: string; strokeWidth?: number }>

/* ==========================================================================
   Shared styles
   ========================================================================== */

const popoverSurface = 'border border-border-subtle bg-surface text-text shadow-elevated'

const itemBase =
  'flex items-center rounded-[calc(var(--radius-lg)-3px)] text-[13px] font-medium transition-colors ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
const itemActive = 'bg-surface text-text'
const itemIdle = 'text-neutral-300 hover:bg-neutral-700 hover:text-neutral-300'

function useFlyoutSide(): 'left' | 'right' {
  // The sidebar sits at the inline start, so its flyouts open toward the inline end.
  return useLayout().dir === 'rtl' ? 'left' : 'right'
}

/* ==========================================================================
   Root
   ========================================================================== */

export type LayoutProps = Omit<ComponentProps<'div'>, 'dir'> & Omit<LayoutProviderProps, 'children'>

export function Layout({
  tenantId,
  userId,
  dir,
  storagePrefix,
  shortcut,
  className,
  style,
  children,
  ...props
}: LayoutProps) {
  const direction = dir ?? getDocumentDirection()

  return (
    <DirectionProvider direction={direction}>
      <LayoutProvider
        tenantId={tenantId}
        userId={userId}
        dir={direction}
        storagePrefix={storagePrefix}
        shortcut={shortcut}
      >
        <TooltipProvider delay={100}>
          <div
            data-slot="layout"
            dir={direction}
            className={cn('flex h-dvh flex-col gap-4 overflow-hidden bg-canvas text-text', className)}
            style={
              {
                '--layout-sidebar-width': '16rem',
                '--layout-sidebar-width-icon': '3rem',
                ...style,
              } as CSSProperties
            }
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </LayoutProvider>
    </DirectionProvider>
  )
}

/* ==========================================================================
   Sidebar: container and slots
   ========================================================================== */

export function LayoutSidebar({ className, children, ...props }: ComponentProps<'aside'>) {
  const { sidebarCompact, mobileSidebarOpen, closeMobileSidebar } = useLayout()

  return (
    <>
      {mobileSidebarOpen && (
        <div
          aria-hidden
          onClick={closeMobileSidebar}
          className="fixed inset-0 z-40 bg-overlay backdrop-blur-[1px] lg:hidden"
        />
      )}

      <aside
        data-slot="layout-sidebar"
        data-state={sidebarCompact ? 'compact' : 'expanded'}
        className={cn(
  'group/sidebar fixed inset-y-0 start-0 z-50 flex w-(--layout-sidebar-width) flex-col bg-neutral-800',
  sidebarCompact ? 'rounded-md' : 'rounded-lg',
  'transition-[width,transform,rounded] duration-200',
  mobileSidebarOpen
    ? 'max-lg:translate-x-0 max-lg:rounded-none'
    : 'max-lg:ltr:-translate-x-full max-lg:rtl:translate-x-full',
  // Desktop: normal flow item, stretches to the row's height.
  'lg:static lg:h-auto lg:shrink-0 lg:translate-x-0',
  sidebarCompact ? 'lg:w-(--layout-sidebar-width-icon)' : 'lg:w-(--layout-sidebar-width)',
  className
)}
        {...props}
      >
        {children}
      </aside>
    </>
  )
}

export function LayoutSidebarHeader({ className, ...props }: ComponentProps<'div'>) {
  const { sidebarCompact } = useLayout()
  return (
    <div
      data-slot="layout-sidebar-header"
      className={cn(
        'flex shrink-0 items-center gap-2',
        sidebarCompact ? 'justify-center p-1.5' : 'p-2',
        className
      )}
      {...props}
    />
  )
}

export function LayoutSidebarContent({ className, ...props }: ComponentProps<'nav'>) {
  return (
    <nav
      data-slot="layout-sidebar-content"
      className={cn('min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 py-2', className)}
      {...props}
    />
  )
}

export function LayoutSidebarFooter({ className, ...props }: ComponentProps<'footer'>) {
  const { sidebarCompact } = useLayout()
  return (
    <footer
      data-slot="layout-sidebar-footer"
      className={cn('shrink-0', sidebarCompact ? 'flex justify-center p-1.5' : 'p-2', className)}
      {...props}
    />
  )
}

/* ==========================================================================
   Sidebar: navigation parts
   ========================================================================== */

/* ---- section ------------------------------------------------------------ */

export function LayoutSidebarSection({
  title,
  className,
  children,
  ...props
}: Omit<ComponentProps<'section'>, 'title'> & { title?: ReactNode }) {
  const { sidebarCompact } = useLayout()

  return (
    <section
      data-slot="layout-sidebar-section"
      className={cn('mt-6 first:mt-0', sidebarCompact && 'mt-3', className)}
      {...props}
    >
      {sidebarCompact ? (
        <div className="mx-auto mb-1.5 h-px w-5 bg-border-strong" />
      ) : (
        title && (
          <h2 className="mb-2 px-3 text-[10px] font-bold tracking-wide text-neutral-400">{title}</h2>
        )
      )}

      <div className={cn('space-y-1', sidebarCompact && 'flex flex-col items-center gap-1.5 space-y-0')}>
        {children}
      </div>
    </section>
  )
}

function ItemIcon({ icon: Icon, className }: { icon?: LayoutIcon; className?: string }) {
  const { sidebarCompact } = useLayout()
  if (!Icon) return null
  return (
    <Icon
      strokeWidth={1.8}
      className={cn(sidebarCompact ? 'size-5' : 'size-[17px] shrink-0', className)}
    />
  )
}

/* ---- single link -------------------------------------------------------- */

export type LayoutSidebarItemProps = {
  href: string
  icon?: LayoutIcon
  /** Match the route exactly (react-router `end`). */
  end?: boolean
  /** Tooltip shown when the sidebar is compact. Defaults to the label. */
  tooltip?: ReactNode
  className?: string
  children: ReactNode
}

export function LayoutSidebarItem({
  href,
  icon,
  end,
  tooltip,
  className,
  children,
}: LayoutSidebarItemProps) {
  const { sidebarCompact, closeMobileSidebar } = useLayout()
  const flyoutSide = useFlyoutSide()

  const link = (
    <NavLink
      data-slot="layout-sidebar-item"
      to={href}
      end={end}
      onClick={closeMobileSidebar}
      className={({ isActive }) =>
        cn(
          itemBase,
          sidebarCompact ? 'size-8 justify-center' : 'h-8 gap-3 px-2',
          isActive ? itemActive : itemIdle,
          className
        )
      }
    >
      <ItemIcon icon={icon} />
      {!sidebarCompact && <span className="flex-1 truncate">{children}</span>}
    </NavLink>
  )

  if (!sidebarCompact) return link

  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipContent side={flyoutSide} sideOffset={10}>
        {tooltip ?? children}
      </TooltipContent>
    </Tooltip>
  )
}

/* ---- submenu ------------------------------------------------------------ */

export type LayoutSidebarSubItemProps = {
  href: string
  end?: boolean
  className?: string
  children: ReactNode
}

export function LayoutSidebarSubItem({ href, end, className, children }: LayoutSidebarSubItemProps) {
  const { closeMobileSidebar } = useLayout()
  return (
    <NavLink
      data-slot="layout-sidebar-sub-item"
      to={href}
      end={end}
      onClick={closeMobileSidebar}
      className={({ isActive }) =>
        cn(itemBase, 'h-7 px-2 text-[12.5px]', isActive ? itemActive : itemIdle, className)
      }
    >
      {children}
    </NavLink>
  )
}

/** Reads the `href` of the <LayoutSidebarSubItem>s so the submenu knows when it is active. */
function collectSubItemRoutes(children: ReactNode): Array<{ href: string; end?: boolean }> {
  const routes: Array<{ href: string; end?: boolean }> = []
  Children.forEach(children, (child) => {
    if (!isValidElement<{ href?: string; end?: boolean; children?: ReactNode }>(child)) return
    if (child.type === Fragment) routes.push(...collectSubItemRoutes(child.props.children))
    else if (child.props.href) routes.push({ href: child.props.href, end: child.props.end })
  })
  return routes
}

/** Hover-opened popover used for the compact sub-menu flyout. */
function HoverPopover({
  trigger,
  className,
  children,
}: {
  trigger: ReactElement
  className?: string
  children: ReactNode
}) {
  const side = useFlyoutSide()
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const show = () => {
    clearTimeout(timer.current)
    setOpen(true)
  }
  const hide = () => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setOpen(false), 120)
  }
  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={trigger} onMouseEnter={show} onMouseLeave={hide} />
      <PopoverContent
        side={side}
        align="start"
        sideOffset={10}
        onMouseEnter={show}
        onMouseLeave={hide}
        className={cn(popoverSurface, className)}
      >
        {children}
      </PopoverContent>
    </Popover>
  )
}

export type LayoutSidebarSubmenuProps = {
  /** Stable id. Used to remember whether the group is open. */
  id: string
  label: string
  icon?: LayoutIcon
  /** Extra route patterns that mark this submenu as active (besides its sub items). */
  match?: string[]
  className?: string
  /** <LayoutSidebarSubItem /> elements. */
  children: ReactNode
}

export function LayoutSidebarSubmenu({
  id,
  label,
  icon,
  match = [],
  className,
  children,
}: LayoutSidebarSubmenuProps) {
  const { pathname } = useLocation()
  const { sidebarCompact, isSubmenuOpen, setSubmenuOpen, toggleSubmenu } = useLayout()

  const open = isSubmenuOpen(id)
  const active =
    collectSubItemRoutes(children).some(({ href, end }) =>
      matchPath({ path: href, end: end ?? false }, pathname)
    ) || match.some((path) => matchPath({ path, end: false }, pathname))

  // Open the group automatically when navigation lands on one of its children.
  useEffect(() => {
    if (active) setSubmenuOpen(id, true)
  }, [active, id, setSubmenuOpen])

  /* Compact rail: icon button + hover flyout listing the sub items. */
  if (sidebarCompact) {
    return (
      <HoverPopover
        className="min-w-40 p-1.5"
        trigger={
          <button
            type="button"
            aria-label={label}
            className={cn(itemBase, 'size-8 justify-center', active ? itemActive : itemIdle, className)}
          >
            <ItemIcon icon={icon} />
          </button>
        }
      >
        <p className="px-2 pb-1 pt-0.5 text-[10px] font-bold tracking-wide text-text-muted">{label}</p>
        <div className="space-y-1">{children}</div>
      </HoverPopover>
    )
  }

  /* Expanded: accordion. */
  return (
    <div data-slot="layout-sidebar-submenu" className={className}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => toggleSubmenu(id)}
        className={cn(
          itemBase,
          'h-8 w-full gap-3 px-2',
          active ? 'text-text hover:bg-neutral-100' : itemIdle
        )}
      >
        <ItemIcon icon={icon} className={active ? 'text-primary' : undefined} />
        <span className="flex-1 truncate text-start">{label}</span>
        <ChevronDown className={cn('size-3.5 opacity-70 transition-transform', open && 'rotate-180')} />
      </button>

      {open && <div className="mt-1 ms-[19px] space-y-1 border-s border-border ps-2">{children}</div>}
    </div>
  )
}

/* ==========================================================================
   Triggers
   ========================================================================== */

/** The small square button used by the layout. Reuse it for your own header actions. */
export function LayoutIconButton({ className, type = 'button', ...props }: ComponentProps<'button'>) {
  return (
    <button
      type={type}
      data-slot="layout-icon-button"
      className={cn(
        'relative inline-flex size-7 shrink-0 items-center justify-center rounded-sm  text-text-muted',
        'transition-colors duration-200 hover:bg-neutral-200 hover:text-text',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        className
      )}
      {...props}
    />
  )
}

const triggerIcons = {
  ltr: { open: PanelLeftClose, closed: PanelLeftOpen },
  rtl: { open: PanelRightClose, closed: PanelRightOpen },
}

/**
 * Toggles the sidebar: collapses the rail on desktop, opens/closes the drawer on mobile.
 * Place it anywhere (header, sidebar header, content). Pass children to replace the icon.
 */
export function LayoutSidebarTrigger({
  children,
  onClick,
  'aria-label': ariaLabel = 'Toggle sidebar',
  ...props
}: ComponentProps<'button'>) {
  const { dir, isDesktop, sidebarCollapsed, mobileSidebarOpen, toggleSidebar } = useLayout()
  const open = isDesktop ? !sidebarCollapsed : mobileSidebarOpen
  const Icon = triggerIcons[dir][open ? 'open' : 'closed']

  return (
    <LayoutIconButton
      data-slot="layout-sidebar-trigger"
      aria-label={ariaLabel}
      aria-expanded={open}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) toggleSidebar()
      }}
      {...props}
    >
      {children ?? <Icon className="size-4.5" />}
    </LayoutIconButton>
  )
}

/* ==========================================================================
   Inset: everything beside the sidebar
   ========================================================================== */


/** Sticky bar. A plain flex row: put whatever you need in it. */
export function LayoutHeader({ className, ...props }: ComponentProps<'header'>) {
  return (
    <header
      data-slot="layout-header"
      className={cn(
        'flex shrink-0 items-center gap-2 bg-surface shadow-card p-2',
        className
      )}
      {...props}
    />
  )
}

export function LayoutInset({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="layout-inset"
      className={cn('mx-auto flex min-h-0 min-w-0 max-w-6xl flex-1 flex-col gap-4', className)}
      {...props}
    />
  )
}

export function LayoutContent({ className, ...props }: ComponentProps<'main'>) {
  return (
    <main
      data-slot="layout-content"
      className={cn('min-h-0 flex-1 overflow-y-auto scrollbar-none ', className)}
      {...props}
    />
  )
}
export function LayoutBody({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="layout-body"
      className={cn('flex min-h-0 px-3 pb-3 flex-1 gap-4', className)}
      {...props}
    />
  )
}