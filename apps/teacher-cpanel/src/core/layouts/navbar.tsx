import { Bell } from 'lucide-react'
import { LayoutHeader, LayoutIconButton, LayoutSidebarTrigger, Popover, PopoverContent, PopoverTrigger } from '@teachedo/ui'
import { NotificationItem, type NotificationItemProps } from '@teachedo/ui/legacy'

type NavbarProps = { onMobileMenuClick?: () => void }
const notifications: NotificationItemProps[] = [
  { variant: 'info', title: 'تذكير بالجدول', description: 'لديك حصة قادمة في جدول اليوم.', timestamp: 'منذ 10 دقائق', read: false },
  { variant: 'success', title: 'تحديث الطلاب', description: 'تم تحديث بيانات مجموعة الفيزياء.', timestamp: 'منذ ساعتين' },
]

export function Navbar({ onMobileMenuClick }: NavbarProps) {
  const unreadCount = notifications.filter((notification) => notification.read === false).length
  return <LayoutHeader><LayoutSidebarTrigger aria-label="تبديل القائمة الجانبية" onClick={onMobileMenuClick} /><h1 className="min-w-0 truncate text-[13px] font-semibold text-text">مساحة المدرس</h1><div className="ms-auto flex items-center gap-1.5"><Popover><PopoverTrigger render={<LayoutIconButton aria-label="الإشعارات" title="الإشعارات" />}><Bell className="size-4.5" strokeWidth={1.8} />{unreadCount > 0 && <span className="absolute -top-1 -inset-e-1 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-destructive-foreground">{unreadCount}</span>}</PopoverTrigger><PopoverContent align="end" sideOffset={8} className="w-80 border border-border-subtle bg-surface p-0 text-text shadow-elevated"><div className="border-b border-border-subtle px-3 py-2"><h2 className="text-[13px] font-bold">الإشعارات</h2></div><div className="max-h-80 overflow-y-auto p-1.5">{notifications.map((notification, index) => <NotificationItem key={notification.timestamp ?? index} {...notification} />)}</div></PopoverContent></Popover></div></LayoutHeader>
}
