import { LayoutSidebarTrigger, LayoutIconButton } from '@teachedo/ui/components'
import { CommandMenu, CommandMenuTrigger, useCommandMenuTrigger } from './command-menu'
import { NotificationsBell } from './notifications-bell'
import { AdminMenu } from './admin-menu'
import { Search } from 'lucide-react'
import { dummyNotifications } from '@/core/layouts/dummy-notifications'
import { cn } from '@/core/utils'

const darkTrigger = 'text-neutral-300 hover:bg-white/15 hover:text-white'

export function Navbar() {
  const { open, setOpen, shortcutLabel } = useCommandMenuTrigger()

  return (
    <>
      <LayoutSidebarTrigger aria-label="تبديل القائمة الجانبية" className={darkTrigger} />

      <h1 className="min-w-0 shrink-0 truncate text-[12px] font-bold uppercase text-neutral-400">
        Teachedo <span className="text-neutral-500">/ لوحة التحكم</span>
      </h1>

      <div className="mx-2 hidden flex-1 sm:block">
        <CommandMenuTrigger onClick={() => setOpen(true)} shortcutLabel={shortcutLabel} />
      </div>

      <div className="ms-auto flex items-center gap-1">
        <LayoutIconButton
          aria-label="بحث"
          className={cn(darkTrigger, 'sm:hidden')}
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