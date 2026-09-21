import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react'
import { NavLink, matchPath, useLocation } from 'react-router-dom'
import {
  Bell,
  ChevronDown,
  ChevronsUpDown,
  Menu,
  PanelRightClose,
  PanelRightOpen,
  X,
} from 'lucide-react'
import { cn } from 'cn'
import { NotificationItem, type NotificationItemProps } from './notification-item'
import { LayoutProvider, useLayout } from './layout_state'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../components/ui/popover' // shadcn
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar' // shadcn
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip' // shadcn
import { DirectionProvider } from '@base-ui/react'

export { LayoutProvider, useLayout } from './layout_state'

/* ==========================================================================
   Types
   ========================================================================== */

export type LayoutNavigationChild = {
  label: string
  href: string
  end?: boolean
}

export type LayoutNavigationItem = {
  label: string
  href: string
  icon: ComponentType<{ className?: string; strokeWidth?: number }>
  end?: boolean
  /** When present the item becomes an expandable group (sub menu). */
  children?: LayoutNavigationChild[]
}

export type LayoutNavigationSection = {
  title: string
  items: LayoutNavigationItem[]
}

export type LayoutUser = {
  name: string
  email?: string
  /** Shown under the name in the navbar (falls back to email). */
  role?: string
  avatarSrc?: string
}

type LayoutShellProps = {
  sidebar: ReactNode
  navbar: ReactNode
  children: ReactNode
  /** Layout preferences (collapsed, open groups) are stored per tenant. */
  tenantId?: string
  /** Optional: scope the stored preferences to the logged-in user as well. */
  userId?: string
}

type LayoutSidebarProps = {
  logo?: ReactNode
  brandName?: ReactNode
  tenantName?: ReactNode
  navigation: LayoutNavigationSection[]
  /** Logged-in user, shown in the fixed sidebar footer. */
  user?: LayoutUser | null
  /** Content of the user dropdown (e.g. <AdminDropdownMenu />). */
  userMenu?: ReactNode
}

type LayoutNavbarProps = {
  /** Anything you want on the start side (e.g. your route icon + label block). */
  title?: ReactNode
  /** Extra buttons placed before the notifications bell (theme switcher, fullscreen...). */
  actions?: ReactNode
  notifications?: NotificationItemProps[]
  onMarkAllRead?: () => void
  user?: LayoutUser | null
  userMenu?: ReactNode
}

/* ==========================================================================
   Shell
   ========================================================================== */

export function LayoutShell({ sidebar, navbar, children, tenantId, userId }: LayoutShellProps) {
  return (
    <DirectionProvider direction='rtl'>
      <LayoutProvider tenantId={tenantId} userId={userId}>
      <div className="min-h-screen bg-canvas text-text">
        <div className="flex gap-4 p-4">
          {sidebar}

          <div className="mx-auto flex min-w-0 max-w-6xl flex-1 flex-col gap-4">
            {navbar}
            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </div>
      </div>
    </LayoutProvider>
    </DirectionProvider>

  )
}

/* ==========================================================================
   Shared helpers
   ========================================================================== */

const popoverSurface = 'border border-border-subtle bg-surface text-text shadow-elevated'

function flyoutSide() {
  return document.documentElement.dir === 'rtl' ? 'left' : 'right'
}

function getInitials(name: string) {
  const letters = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => Array.from(word)[0])
  return letters.join('').toUpperCase() || '?'
}

function UserAvatar({ user, className }: { user: LayoutUser; className?: string }) {
  return (
    <Avatar className={className}>
      {user.avatarSrc && <AvatarImage className={"rounded-sm"} src={user.avatarSrc} alt={user.name} />}
      <AvatarFallback>
        <Avatar><AvatarImage src='https://github.com/shadcn.png'/></Avatar>

      </AvatarFallback>
    </Avatar>
  )
}

/** Dropdown shared by the navbar and the sidebar footer. */
function UserMenuPopover({
  userMenu,
  trigger,
  side,
  align,
  sideOffset = 8,
}: {
  user: LayoutUser
  userMenu?: ReactNode
  trigger: ReactNode
  side: 'top' | 'bottom' | 'left' | 'right'
  align: 'start' | 'center' | 'end'
  sideOffset?: number
}) {
  return (
    <Popover>
      <PopoverTrigger>{trigger}</PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        sideOffset={sideOffset}
        className={cn('w-64 p-1.5', popoverSurface)}
      >

        {userMenu && <div className="">{userMenu}</div>}
      </PopoverContent>
    </Popover>
  )
}

/** A hover-opened shadcn Popover (used for the collapsed sub-menu flyout). */
function HoverPopover({
  trigger,
  children,
  side,
  align = 'start',
  className,
}: {
  trigger: ReactNode
  children: ReactNode
  side: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
  className?: string
}) {
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
      <PopoverTrigger onMouseEnter={show} onMouseLeave={hide}>
        {trigger}
      </PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        sideOffset={10}
        onMouseEnter={show}
        onMouseLeave={hide}
        // onOpenAutoFocus={(event) => event.preventDefault()}
        className={cn(popoverSurface, className)}
      >
        {children}
      </PopoverContent>
    </Popover>
  )
}

/* ==========================================================================
   Sidebar
   ========================================================================== */

// Reactive `lg` (>=1024px) check so collapsed-mode JSX always matches the CSS breakpoint.
function useIsLargeScreen() {
  const [isLarge, setIsLarge] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  )

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)')
    const handleChange = () => setIsLarge(mql.matches)
    handleChange()
    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [])

  return isLarge
}

const itemBase =
  'group flex items-center rounded-sm text-[13px] font-medium transition-colors ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
const itemActive = 'bg-primary text-primary-foreground'
const itemIdle = 'text-text-muted hover:bg-neutral-100 hover:text-text'
const childLink = 'h-7 px-2 text-[12.5px]'

function isChildActive(child: LayoutNavigationChild, pathname: string) {
  return Boolean(matchPath({ path: child.href, end: child.end ?? false }, pathname))
}

/* ---- single link -------------------------------------------------------- */

function NavigationLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: LayoutNavigationItem
  collapsed: boolean
  onNavigate: () => void
}) {
  const Icon = item.icon

  const link = (
    <NavLink
      to={item.href}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          itemBase,
          collapsed ? 'h-8 w-8 justify-center' : 'h-8 gap-3 px-2',
          isActive ? itemActive : itemIdle
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn(
              collapsed ? 'h-5 w-5' : 'h-[17px] w-[17px] shrink-0',
              isActive ? 'text-primary-foreground' : 'text-text-muted group-hover:text-text'
            )}
            strokeWidth={1.8}
          />
          {!collapsed && <span className="flex-1">{item.label}</span>}
        </>
      )}
    </NavLink>
  )

  if (!collapsed) return link

  return (
    <Tooltip>
      <TooltipTrigger>{link}</TooltipTrigger>
      <TooltipContent
        side={flyoutSide()}
        sideOffset={10}
      >
        {item.label}
      </TooltipContent>
    </Tooltip>
  )
}

/* ---- group with sub menu ------------------------------------------------ */

function NavigationGroup({
  item,
  collapsed,
  onNavigate,
}: {
  item: LayoutNavigationItem
  collapsed: boolean
  onNavigate: () => void
}) {
  const Icon = item.icon
  const children = item.children ?? []
  const { pathname } = useLocation()
  const { isGroupOpen, setGroupOpen, toggleGroup } = useLayout()
  const groupId = item.href
  const open = isGroupOpen(groupId)
  const childActive = children.some((child) => isChildActive(child, pathname))

  // Open the group automatically when navigation lands on one of its children.
  useEffect(() => {
    if (childActive) setGroupOpen(groupId, true)
  }, [childActive, groupId, setGroupOpen])

  /* Collapsed rail: icon button + hover flyout listing the children */
  if (collapsed) {
    return (
      <HoverPopover
        side={flyoutSide()}
        align="start"
        className="min-w-40 p-1.5"
        trigger={
          <button
            type="button"
            aria-label={item.label}
            className={cn(itemBase, 'h-8 w-8 justify-center', childActive ? itemActive : itemIdle)}
          >
            <Icon
              className={cn(
                'h-5 w-5',
                childActive ? 'text-primary-foreground' : 'text-text-muted group-hover:text-text'
              )}
              strokeWidth={1.8}
            />
          </button>
        }
      >
        <p className="px-2 pb-1 pt-0.5 text-[10px] font-bold tracking-wide text-text-muted">
          {item.label}
        </p>
        <div className="space-y-1">
          {children.map((child) => (
            <NavLink
              key={child.href}
              to={child.href}
              end={child.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(itemBase, childLink, isActive ? itemActive : itemIdle)
              }
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      </HoverPopover>
    )
  }

  /* Expanded: accordion */
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => toggleGroup(groupId)}
        className={cn(
          itemBase,
          'h-8 w-full gap-3 px-2',
          childActive ? 'text-text hover:bg-neutral-100' : itemIdle
        )}
      >
        <Icon
          className={cn(
            'h-[17px] w-[17px] shrink-0',
            childActive ? 'text-primary' : 'text-text-muted group-hover:text-text'
          )}
          strokeWidth={1.8}
        />
        <span className="flex-1 text-start">{item.label}</span>
        <ChevronDown
          className={cn('h-3.5 w-3.5 opacity-70 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="mt-1 ms-[19px] space-y-1 border-s border-border ps-2">
          {children.map((child) => (
            <NavLink
              key={child.href}
              to={child.href}
              end={child.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(itemBase, childLink, isActive ? itemActive : itemIdle)
              }
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

/* ---- section ------------------------------------------------------------ */

function NavigationSection({
  section,
  collapsed,
  onNavigate,
}: {
  section: LayoutNavigationSection
  collapsed: boolean
  onNavigate: () => void
}) {
  return (
    <section className={cn('mt-6 first:mt-0', collapsed && 'mt-3')}>
      {collapsed ? (
        <div className="mx-auto mb-1.5 h-px w-5 bg-border-strong" />
      ) : (
        <h2 className="mb-2 px-3 text-[10px] font-bold tracking-wide text-text-muted">
          {section.title}
        </h2>
      )}

      <div className={cn('space-y-1', collapsed && 'flex flex-col items-center gap-1.5 space-y-0')}>
        {section.items.map((item) =>
          item.children?.length ? (
            <NavigationGroup key={item.href} item={item} collapsed={collapsed} onNavigate={onNavigate} />
          ) : (
            <NavigationLink key={item.href} item={item} collapsed={collapsed} onNavigate={onNavigate} />
          )
        )}
      </div>
    </section>
  )
}

/* ---- fixed footer: logged-in user --------------------------------------- */

function SidebarUser({
  user,
  userMenu,
  compact,
}: {
  user: LayoutUser
  userMenu?: ReactNode
  compact: boolean
}) {
  return (
    <UserMenuPopover
      user={user}
      userMenu={userMenu}
      side={compact ? flyoutSide() : 'top'}
      align={compact ? 'end' : 'start'}
      sideOffset={compact ? 12 : 8}
      trigger={
        compact ? (
          <button
            type="button"
            aria-label={user.name}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <UserAvatar user={user} className="size-8" />
          </button>
        ) : (
          <button
            type="button"
            className="flex w-60 items-center gap-2.5 rounded-sm p-1.5 text-start transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <UserAvatar user={user} className="size-8" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-semibold leading-4 text-text">{user.name}</span>
              {(user.email ?? user.role) && (
                <span className="block truncate text-[11px] leading-4 text-text-muted">
                  {user.email ?? user.role}
                </span>
              )}
            </span>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-text-muted" />
          </button>
        )
      }
    />
  )
}

function DefaultLogo() {
  return (
    <div>
      <Avatar>
        <AvatarImage
          src={"https://orthotecfp.com/assets/logo-uDLTKkZi.png"}
        />
      </Avatar>
    </div>
  )
}

export function LayoutSidebar({
  logo,
  brandName = 'Teachedo',
  tenantName,
  navigation,
  user,
  userMenu,
}: LayoutSidebarProps) {
  const { sidebarCollapsed, mobileSidebarOpen, closeMobileSidebar } = useLayout()
  const isLargeScreen = useIsLargeScreen()
  // Collapse only applies on large screens; the mobile drawer is always expanded.
  const compact = sidebarCollapsed && isLargeScreen

  return (
    <TooltipProvider delay={100}>
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="إغلاق القائمة الجانبية"
          onClick={closeMobileSidebar}
          className="fixed inset-0 z-40 bg-overlay backdrop-blur-[1px] lg:hidden"
        />
      )}

      <aside
        aria-label="القائمة الرئيسية"
        data-collapsed={compact}
        className={cn(
          'fixed inset-y-0 start-0 z-50 flex w-64 flex-col rounded-md bg-surface transition-[width,transform] duration-200',
          mobileSidebarOpen
            ? 'max-lg:translate-x-0 max-lg:rounded-none'
            : 'max-lg:ltr:translate-x-full max-lg:rtl:translate-x-full',
          // Desktop: sticky column inside the flex row, inline with the p-4 gap.
          'lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:shrink-0 lg:translate-x-0',
          compact ? 'lg:w-12' : 'lg:w-64'
        )}
      >
        {/* Header */}
        <div className={cn('shrink-0', compact ? 'p-1.5' : 'p-2')}>
          <div className={cn('flex items-center gap-2', compact ? 'justify-center' : 'justify-between')}>
            <div className="flex min-w-0 items-center gap-2">
              {logo ?? <DefaultLogo />}
              {!compact && (
                <div className="min-w-0 select-none">
                  <p className="truncate text-[17px] font-medium leading-5 text-text">{brandName}</p>
                  {tenantName && (
                    <p className="truncate text-[11px] leading-4 text-text-muted">{tenantName}</p>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={closeMobileSidebar}
              aria-label="إغلاق القائمة الجانبية"
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-muted hover:bg-neutral-100 hover:text-text focus-visible:outline-2 focus-visible:outline-primary lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable navigation */}
        <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 py-2">
          {navigation.map((section) => (
            <NavigationSection
              key={section.title}
              section={section}
              collapsed={compact}
              onNavigate={closeMobileSidebar}
            />
          ))}
        </nav>

        {/* Fixed footer: logged-in user */}
        {user && (
          <footer
            className={cn(
              'shrink-0',
              compact ? 'flex justify-center p-1.5' : 'p-2'
            )}
          >
            <SidebarUser user={user} userMenu={userMenu} compact={compact} />
          </footer>
        )}
      </aside>
    </TooltipProvider>
  )
}

/* ==========================================================================
   Navbar
   ========================================================================== */

const navbarIconButton =
  'relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-neutral-100 text-text-muted ' +
  'transition-colors duration-200 hover:bg-neutral-200/80 hover:text-text ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

export function LayoutNavbar({
  title,
  actions,
  notifications = [],
  onMarkAllRead,
  user,
  userMenu,
}: LayoutNavbarProps) {
  const { sidebarCollapsed, mobileSidebarOpen, toggleSidebarCollapsed, toggleMobileSidebar } = useLayout()
  const unreadCount = notifications.filter((notification) => notification.read === false).length

  return (
    <header className="sticky top-4 z-30 rounded-sm bg-surface/80 p-1.5 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          {/* Mobile: open / close the drawer */}
          <button
            type="button"
            onClick={toggleMobileSidebar}
            aria-label={mobileSidebarOpen ? 'إغلاق القائمة الجانبية' : 'فتح القائمة الجانبية'}
            aria-expanded={mobileSidebarOpen}
            className={cn(navbarIconButton, 'lg:hidden')}
          >
            {mobileSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          {/* Desktop: collapse / expand the sidebar (Ctrl/Cmd + B) */}
          <button
            type="button"
            onClick={toggleSidebarCollapsed}
            aria-label={sidebarCollapsed ? 'توسيع القائمة الجانبية' : 'طي القائمة الجانبية'}
            aria-pressed={sidebarCollapsed}
            title="Ctrl + B"
            className={cn(navbarIconButton, 'hidden lg:inline-flex')}
          >
            {sidebarCollapsed ? <PanelRightOpen className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />}
          </button>

          {title}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {actions}

          {/* Notifications */}
          <Popover>
            <PopoverTrigger>
              <button type="button" aria-label="الإشعارات" title="الإشعارات" className={navbarIconButton}>
                <Bell className="h-4 w-4" strokeWidth={1.8} />
                {unreadCount > 0 && (
                  <span className="absolute -inset-e-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold leading-none text-destructive-foreground font-mono">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </PopoverTrigger>

            <PopoverContent align="end" sideOffset={8} className={cn('w-80 p-0', popoverSurface)}>
              <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2">
                <h2 className="text-[13px] font-bold text-text">الإشعارات</h2>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && <span className="text-[10px] text-text-muted">{unreadCount} جديدة</span>}
                  {onMarkAllRead && unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={onMarkAllRead}
                      className="text-[11px] font-semibold text-primary transition-colors hover:text-primary-hover"
                    >
                      تحديد الكل كمقروء
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto p-1.5">
                {notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                    <NotificationItem key={notification.timestamp ?? index} {...notification} />
                  ))
                ) : (
                  <p className="p-4 text-center text-[11px] text-text-muted">لا توجد إشعارات جديدة</p>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Logged-in user */}
          {user && (
            <UserMenuPopover
              user={user}
              userMenu={userMenu}
              side="bottom"
              align="end"
              trigger={
                <button
                  type="button"
                  aria-label={user.name}
                  className="group flex h-7 items-center gap-2 rounded-sm bg-neutral-100 ps-1 pe-1 transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:pe-2"
                >
                  <UserAvatar user={user} className="size-5" />
                  <span className="hidden min-w-0 flex-col justify-center text-start md:flex">
                    <span className="block max-w-32  text-[11px] font-medium leading-3 text-text">
                      {user.name}
                    </span>
                    {/* {(user.role ?? user.email) && (
                      <span className="block max-w-32 truncate text-[10px] leading-3 text-text-muted">
                        {user.role ?? user.email}
                      </span>
                    )} */}
                  </span>
                  <ChevronsUpDown className="hidden h-3 w-3 shrink-0 text-text-muted md:block" />
                </button>
              }
            />
          )}
        </div>
      </div>
    </header>
  )
}