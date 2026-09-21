import { useState, type ComponentProps } from 'react'
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import { ChevronsUpDown, LogOut, Settings, User, type LucideIcon } from 'lucide-react'
import { AvatarImage, useLayout } from '@teachedo/ui/components'
import {
  Avatar,
  AvatarFallback,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@teachedo/ui/components'
import { useAdminMe } from '@/modules/auth/api/auth.queries'
import { useAdminLogout } from '@/modules/auth/api/auth.mutations'

const menuItemTones = {
  default: 'hover:bg-neutral-50',
  destructive: 'bg-destructive/20 text-destructive-subtle-foreground hover:bg-destructive/30',
}

function MenuItem({
  icon: Icon,
  tone = 'default',
  children,
  ...props
}: ComponentProps<'button'> & { icon: LucideIcon; tone?: keyof typeof menuItemTones }) {
  return (
    <button
      type="button"
      className={`flex w-full items-center gap-1.5 rounded-sm px-1 py-1.5 text-start text-[12px] font-medium transition-colors duration-150 disabled:opacity-60 ${menuItemTones[tone]}`}
      {...props}
    >
      <Icon className="size-4" />
      {children}
    </button>
  )
}

function UserAvatar() {
  return (
    <Avatar className="size-8">
      <AvatarFallback>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="User Avatar" />
        </Avatar>
      </AvatarFallback>
    </Avatar>
  )
}

export function UserMenu() {
  const navigate = useNavigate()
  const { dir, sidebarCompact } = useLayout()
  const { data: admin } = useAdminMe()
  const logoutMutation = useAdminLogout()
  const [open, setOpen] = useState(false)

  const name = admin?.name || 'مدير النظام'
  const email = admin?.email || 'admin@edu.eg'

  // Compact rail: open toward the content. Expanded: open above the trigger.
  const side = sidebarCompact ? (dir === 'rtl' ? 'left' : 'right') : 'top'
  const align = sidebarCompact ? 'end' : 'start'

  const goTo = (path: string) => {
    setOpen(false)
    navigate(path)
  }

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync()
    } finally {
      Cookies.remove('access_token')
      localStorage.removeItem('access_token')
      navigate('/login', { replace: true })
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={name}
            className="flex w-full items-center gap-2.5 rounded-md p-1.5 text-start transition-colors bg-neutral-50 hover:bg-neutral-50/90 group-data-[state=compact]/sidebar:w-auto group-data-[state=compact]/sidebar:p-0"
          />
        }
      >
        <UserAvatar />
        <span className="min-w-0 flex-1 group-data-[state=compact]/sidebar:hidden">
          <span className="block truncate text-[12px] font-semibold leading-4 text-text">{name}</span>
          <span className="block truncate text-[11px] leading-4 text-text-muted" dir="rtl">
            {email}
          </span>
        </span>
        <ChevronsUpDown className="size-3.5 shrink-0 text-text-muted group-data-[state=compact]/sidebar:hidden" />
      </PopoverTrigger>

      <PopoverContent
        side={side}
        align={align}
        sideOffset={8}
        className="w-64 border border-border-subtle bg-surface p-1.5 text-text shadow-elevated"
      >
        <div className="mb-1 flex items-center gap-2.5 rounded-sm bg-neutral-50 p-1.5">
          <UserAvatar />
          <div className="min-w-0">
            <p className="truncate text-[12px] font-bold text-text">{name}</p>
            <p className="truncate font-inter text-[10px] text-text-muted" dir="ltr">
              {email}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-0.5">
          <MenuItem icon={User} onClick={() => goTo('/settings')}>
            الملف الشخصي
          </MenuItem>
          <MenuItem icon={Settings} onClick={() => goTo('/settings')}>
            إعدادات النظام
          </MenuItem>
          <MenuItem icon={LogOut} tone="destructive" onClick={logout} disabled={logoutMutation.isPending}>
            تسجيل الخروج
          </MenuItem>
        </div>
      </PopoverContent>
    </Popover>
  )
}