import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut, School, Settings, User as UserIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  LayoutSidebar,
  Popover,
  type LayoutNavigationItem,
  type LayoutNavigationSection,
} from '@teachedo/ui/legacy'
import { cn } from '@/core/utils'
import { useLayoutSettings } from './layout_settings'
import { AVATAR_PLACEHOLDER, LOGO } from '@/core/assets'
import { useAdminMe } from '@/modules/auth/api/auth.queries'
import { useAdminLogout } from '@/modules/auth/api/auth.mutations'
import Cookies from 'js-cookie'

const navigation: LayoutNavigationSection[] = [
  {
    title: 'عام (GENERAL)',
    items: [
      { label: 'لوحة التحكم', href: '/', icon: LayoutDashboard, end: true },
      { label: 'إدارة المدرسين', href: '/teachers', icon: School },
    ],
  },
  {
    title: 'النظام (SYSTEM)',
    items: [{ label: 'إعدادات المنصة', href: '/settings', icon: Settings }],
  },
]

function renderNavigationItem(item: LayoutNavigationItem, collapsed: boolean) {
  const Icon = item.icon
  const link = (
    <NavLink
      to={item.href}
      end={item.end}
      className={({ isActive }) =>
        cn(
          'group flex items-center transition-colors duration-200',
          collapsed
            ? 'mx-auto h-9 w-9 justify-center rounded-sm'
            : 'mx-3 h-8 gap-3 rounded-sm px-3.5 text-[13px] font-semibold',
          isActive
            ? 'bg-surface text-text'
            : 'text-secondary-foreground/70 hover:bg-surface/10 hover:text-secondary-foreground/90'
        )
      }
    >
      <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
    </NavLink>
  )
  return collapsed ? (
    <Popover
      side="left"
      align="center"
      offset={10}
      triggerType="hover"
      contentClassName="rounded-xs bg-surface px-3 py-1 text-[12px] font-medium whitespace-nowrap text-text shadow-sm"
      trigger={link}
    >
      {item.label}
    </Popover>
  ) : (
    link
  )
}

type SidebarProps = { mobileOpen: boolean; onMobileClose: () => void }

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const navigate = useNavigate()
  const { isSidebarCollapsed, toggleSidebar } = useLayoutSettings()
  const { data: admin } = useAdminMe()
  const logoutMutation = useAdminLogout()
  const name = admin?.name || 'مدير النظام'
  const email = admin?.email || 'admin@edu.eg'
  const logout = async () => {
    try {
      await logoutMutation.mutateAsync()
    } finally {
      Cookies.remove('access_token')
      localStorage.removeItem('access_token')
      navigate('/login', { replace: true })
    }
  }
  const userMenu = (
    <DropdownMenu
      align="end"
      side="left"
      offset={8}
      trigger={
        <div
          className={cn(
            'flex w-full items-center rounded-sm transition-colors duration-200',
            isSidebarCollapsed
              ? 'justify-center'
              : 'cursor-pointer bg-white/5 px-1.5 py-1 hover:bg-white/10'
          )}
        >
          <img
            src={AVATAR_PLACEHOLDER}
            className="h-8 w-8 shrink-0 rounded-sm object-cover"
            alt=""
          />
          {!isSidebarCollapsed && (
            <div className="ms-3 min-w-0 text-start">
              <span className="block truncate text-[13px] font-bold text-white">{name}</span>
              <span className="block truncate font-inter text-[11px] text-white/50" dir="ltr">
                {email}
              </span>
            </div>
          )}
        </div>
      }
    >
      <div className="mb-1 flex items-center gap-2.5 rounded-sm bg-neutral-100 px-1.5 py-1.5">
        <div className="bg-surface-secondary">
          <img src={AVATAR_PLACEHOLDER} className="h-9 w-9 rounded-sm object-cover" alt="" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[12px] font-bold text-text">{name}</p>
          <p className="truncate font-inter text-[10px] text-text-muted" dir="ltr">
            {email}
          </p>
        </div>
      </div>
      <DropdownMenuItem icon={<UserIcon />} onSelect={() => navigate('/settings')}>
        الملف الشخصي
      </DropdownMenuItem>
      <DropdownMenuItem icon={<Settings />} onSelect={() => navigate('/settings')}>
        إعدادات النظام
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem variant="danger" icon={<LogOut />} onSelect={logout}>
        تسجيل الخروج
      </DropdownMenuItem>
    </DropdownMenu>
  )
  return (
    <LayoutSidebar
      mobileOpen={mobileOpen}
      onMobileClose={onMobileClose}
      isCollapsed={isSidebarCollapsed}
      onToggleCollapsed={toggleSidebar}
      logo={
        <>
          <img src={LOGO} alt="Logo" className="h-8 w-8 object-contain invert" />
          <span className="text-[18px] font-bold tracking-tight text-white">EDU-HUB</span>
        </>
      }
      navigation={navigation}
      renderNavigationItem={renderNavigationItem}
      user={{ name, email, avatarSrc: AVATAR_PLACEHOLDER }}
      userMenu={userMenu}
    />
  )
}
