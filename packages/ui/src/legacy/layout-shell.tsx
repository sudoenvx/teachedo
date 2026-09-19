import { useEffect, useState, type ReactNode } from 'react'
import { Bell, GraduationCap, Maximize, Menu, Minimize, PanelRightClose, PanelRightOpen, School, Settings } from 'lucide-react'
import { cn } from 'cn'
import { IconButton } from './icon-button'
import { NotificationItem, type NotificationItemProps } from './notification-item'
import { Popover } from './popover'
import { BiLogOut } from 'react-icons/bi'
import { ThemeSwitcher } from './theme-switcher'
import { QuickActions } from './quick-actions'

export type LayoutNavigationItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  end?: boolean
}

export type LayoutNavigationSection = {
  title: string
  items: LayoutNavigationItem[]
}

export type LayoutUser = {
  name: ReactNode
  email?: ReactNode
  avatarSrc?: string
}

type LayoutShellProps = {
  sidebar: ReactNode
  navbar: ReactNode
  children: ReactNode
}

type LayoutSidebarProps = {
  mobileOpen: boolean
  onMobileClose: () => void
  isCollapsed: boolean
  onToggleCollapsed: () => void
  logo?: ReactNode
  navigation: LayoutNavigationSection[]
  renderNavigationItem: (item: LayoutNavigationItem, isCollapsed: boolean) => ReactNode
  user: LayoutUser
  userMenu: ReactNode
}

type LayoutNavbarProps = {
  onMobileMenuClick: () => void
  title: ReactNode
  onLogout?: () => void
  actions?: ReactNode
  notifications?: NotificationItemProps[]
}

export function LayoutShell({ sidebar, navbar, children }: LayoutShellProps) {
  const [isFullscreen, setIsFullscreen] = useState(() => Boolean(document.fullscreenElement))

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])
  

  return (
    <div className="flex h-screen w-full overflow-hidden bg-secondary-hover text-ink" dir="rtl">
      {sidebar}
      <div
        className={cn(
          'flex h-screen min-w-0 flex-1 flex-col overflow-hidden transition-[padding] duration-300 ease-in-out',
          isFullscreen ? 'p-0' : 'py-2 pl-2 pr-0 max-lg:pr-2'
        )}
      >
        <div
          className={cn(
            'relative flex min-w-0 flex-1 flex-col overflow-hidden bg-canvas transition-[border-radius] duration-300 ease-in-out',
            isFullscreen ? 'rounded-none' : 'rounded-md'
          )}
        >
          {/* الـ Navbar ثابت هنا ومفصول عن منطقة التمرير */}
          <div className="z-30 shrink-0 bg-canvas">
            {navbar}
          </div>

          {/* منطقة المحتوى القابلة للتمرير (Scrolling Area) */}
          <main className="flex-1 overflow-y-auto scroll-smooth px-4 pb-4 md:px-6 md:pb-6 ">
            <div className="mx-auto h-full max-w-7xl pt-2">
              {children}
            </div>

            
          </main>

          <QuickActions columns={2} actions={[{ id: 'add-teacher', label: 'إضافة مدرس', icon: <School size={16} />, onClick: () => {} }, { id: 'teachers', label: 'المدرسون', icon: <GraduationCap size={16} />, onClick: () => {} }, { id: 'settings', label: 'الإعدادات', icon: <Settings size={16} />, onClick: () => {} }]} />
        </div>
      </div>
    </div>
  )
}

export function LayoutSidebar({
  mobileOpen,
  onMobileClose,
  isCollapsed,
  onToggleCollapsed,
  logo,
  navigation,
  renderNavigationItem,
  user,
  userMenu,
}: LayoutSidebarProps) {
  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="إغلاق القائمة"
          className="fixed inset-0 z-40 cursor-default border-0 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={onMobileClose}
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex h-full shrink-0 flex-col bg-transparent transition-[width,transform,background-color] duration-300 ease-in-out lg:static',
          mobileOpen ? 'w-64 translate-x-0 bg-secondary' : 'translate-x-full lg:translate-x-0',
          isCollapsed ? 'lg:w-14' : 'lg:w-64'
        )}
      >
        <div
          className={cn(
            'flex h-20 shrink-0 items-center',
            isCollapsed ? 'justify-center' : 'justify-between px-5'
          )}
        >
          {!isCollapsed && <div className="flex select-none items-center gap-2.5">{logo}</div>}
          <button
            type="button"
            onClick={onToggleCollapsed}
            title={isCollapsed ? 'توسيع القائمة' : 'طي القائمة'}
            className="hidden h-8 w-8 items-center justify-center rounded-sm text-white/50 transition-colors hover:bg-white/10 hover:text-white lg:flex"
          >
            {isCollapsed ? (
              <PanelRightOpen size={20} strokeWidth={2} />
            ) : (
              <PanelRightClose size={20} strokeWidth={2} />
            )}
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-6 overflow-x-hidden overflow-y-auto py-2">
          {navigation.map((section) => (
            <div key={section.title} className="flex flex-col gap-1.5">
              {!isCollapsed && (
                <p className="mb-1.5 px-6 text-[10px] font-bold uppercase tracking-widest text-white/40">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => (
                <div key={item.href}>{renderNavigationItem(item, isCollapsed)}</div>
              ))}
            </div>
          ))}
        </nav>

        <footer className="flex shrink-0 items-center justify-center p-4">
          <div className="w-full">{userMenu}</div>
          <span className="sr-only">
            {user.name} {user.email}
          </span>
        </footer>
      </aside>
    </>
  )
}

export function LayoutNavbar({
  onMobileMenuClick,
  title,
  onLogout,
  actions,
  notifications = [],
}: LayoutNavbarProps) {
  const [isFullscreen, setIsFullscreen] = useState(() => Boolean(document.fullscreenElement))

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await document.documentElement.requestFullscreen()
  }

  return (
    <header className="flex py-2 md:py-3 bg-transparent w-full items-center justify-between px-2 md:px-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMobileMenuClick}
          aria-label="فتح القائمة"
          className="inline-flex h-7 w-7 items-center justify-center rounded-sm bg-secondary/10 text-text hover:bg-secondary/20 lg:hidden"
        >
          <Menu className="h-4.5 w-4.5" strokeWidth={2} />
        </button>
        <h1 className="text-[17px] font-medium font-inter text-text uppercase tracking-tight m-0">{title}</h1>
      </div>

      <div className="flex items-center gap-1">
        {actions}

        <Popover
          side="bottom"
          align="start"
          trigger={
            <span>
              <IconButton
                icon={<Bell />}
                aria-label="الإشعارات"
                title="الإشعارات"
                color="secondary"
                style="ghost"
                tooltipSide='bottom'
                size="md"
              />
            </span>
          }
        >
          <div className="w-80 p-2" dir="rtl">
            <div className="mb-1 flex items-center justify-between px-2 py-1">
              <h2 className="text-[13px] font-bold text-text">الإشعارات</h2>
              <span className="text-[10px] text-text-muted">{notifications.length} جديدة</span>
            </div>
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <NotificationItem key={notification.timestamp ?? index} {...notification} />
              ))
            ) : (
              <p className="p-3 text-center text-[11px] text-text-muted">لا توجد إشعارات جديدة</p>
            )}
          </div>
        </Popover>

        <IconButton
          icon={isFullscreen ? <Minimize /> : <Maximize />}
          aria-label="ملء الشاشة"
          title="ملء الشاشة"
          color="secondary"
          style="ghost"
          tooltipSide='bottom'
          size="md"
          onClick={toggleFullscreen}
        />

        <ThemeSwitcher />

        {onLogout && (
          <IconButton
            icon={<BiLogOut />}
            aria-label="تسجيل الخروج"
            title="تسجيل الخروج"
            tooltipSide='bottom'
            color="danger"
            style="solid"
            size="md"
            onClick={onLogout}
          />
        )}
      </div>
    </header>
  )
}