import { LayoutSidebarTrigger, LayoutIconButton } from '@teachedo/ui/components'
import { CommandMenu, CommandMenuTrigger, useCommandMenuTrigger } from './command-menu'
import { NotificationsBell } from './notifications-bell'
import { AdminMenu } from './admin-menu'
import { Search } from 'lucide-react'
import { dummyNotifications } from '@/core/layouts/dummy-notifications'
import { cn } from 'cn'


type AdminRole = 'super-admin' | 'admin'

const roleTagStyles: Record<AdminRole, string> = {
  'super-admin': 'bg-accent-subtle text-accent-subtle-text',
  admin: 'bg-primary-subtle text-primary-subtle-text',
}

function RoleTag({ role }: { role: AdminRole }) {
  const label = role === 'super-admin' ? 'Super Admin' : 'Admin'

  return (
    <span className={`hidden rounded-sm px-2.5 py-1 text-[11px] font-normal uppercase font-inter sm:inline-flex ${roleTagStyles[role]}`}>
      {label}
    </span>
  )
}

export function Navbar() {
  const { open, setOpen, shortcutLabel } = useCommandMenuTrigger()

  return (
    <>
      <LayoutSidebarTrigger aria-label="تبديل القائمة الجانبية"  />

      <h1 className="min-w-0 shrink-0 truncate text-sm font-semibold uppercase text-primary-hover">
        Teachedo Dashboard
      </h1>

      <div className="mx-2 hidden flex-1 sm:block">
        <CommandMenuTrigger onClick={() => setOpen(true)} shortcutLabel={shortcutLabel} />
      </div>

      <RoleTag role="super-admin" />

      <div className="ms-auto flex items-center gap-1">
        <LayoutIconButton
          aria-label="بحث"
          className={cn('sm:hidden')}
          onClick={() => setOpen(true)}
        >
          <Search className="size-4.5" strokeWidth={1.8} />
        </LayoutIconButton>

        <NotificationsBell notifications={dummyNotifications} onMarkAllRead={() => {}} />

        <div className="mx-1 h-5 w-px bg-white/10" />

        <AdminMenu />
      </div>

      <CommandMenu open={open} onOpenChange={setOpen} />
    </>
  )
}