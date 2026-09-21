import { GraduationCap, LayoutDashboard, School, Settings, X } from 'lucide-react'
import {
  LayoutSidebar,
  LayoutSidebarContent,
  LayoutSidebarFooter,
  LayoutSidebarHeader,
  LayoutSidebarItem,
  LayoutSidebarSection,
  LayoutSidebarTrigger
} from '@teachedo/ui/components'
import { Avatar, AvatarImage } from '@teachedo/ui/components'
import { UserMenu } from './user-menu'

export function Sidebar() {
  return (
    <LayoutSidebar aria-label="القائمة الرئيسية">
      <LayoutSidebarHeader>
        <div className="flex min-w-0  p-1 rounded-sm flex-1 items-center gap-2.5 group-data-[state=compact]/sidebar:flex-col group-data-[state=compact]/sidebar:gap-1 ">
          <Avatar className="size-8 rounded-sm bg-accent text-accent-foreground group-data-[state=compact]/sidebar:size-8">
            <AvatarImage src="" alt="" />
            <span className="flex size-full items-center justify-center" aria-hidden="true">
              <GraduationCap className="size-5 group-data-[state=compact]/sidebar:size-5" />
            </span>
          </Avatar>

          <div className="min-w-0 flex-1 group-data-[state=compact]/sidebar:hidden">


          </div>
        </div>

        {/* Mobile only: closes the drawer. */}
        <LayoutSidebarTrigger aria-label="إغلاق القائمة الجانبية" className="lg:hidden bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-neutral-50 w-6.5 h-6.5 ">
          <X className="size-4" />
        </LayoutSidebarTrigger>
      </LayoutSidebarHeader>

      <LayoutSidebarContent aria-label="التنقل">
        <LayoutSidebarSection title="عام (GENERAL)">
          <LayoutSidebarItem href="/" icon={LayoutDashboard} end>
            لوحة التحكم
          </LayoutSidebarItem>
          <LayoutSidebarItem href="/teachers" icon={School}>
            إدارة المدرسين
          </LayoutSidebarItem>
        </LayoutSidebarSection>

        <LayoutSidebarSection title="النظام (SYSTEM)">
          <LayoutSidebarItem href="/settings" icon={Settings}>
            إعدادات المنصة
          </LayoutSidebarItem>
        </LayoutSidebarSection>
      </LayoutSidebarContent>

      <LayoutSidebarFooter>
        <UserMenu />
      </LayoutSidebarFooter>
    </LayoutSidebar>
  )
}