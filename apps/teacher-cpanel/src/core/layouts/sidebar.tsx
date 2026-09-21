import { useNavigate } from 'react-router-dom'
import { GraduationCap, LayoutDashboard, LogOut, UserCheck, Users, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage, DropdownMenu, DropdownMenuItem, DropdownMenuSeparator, LayoutSidebar, LayoutSidebarContent, LayoutSidebarFooter, LayoutSidebarHeader, LayoutSidebarItem, LayoutSidebarSection, LayoutSidebarTrigger, useLayout } from '@teachedo/ui'
import { AVATAR_PLACEHOLDER, LOGO } from '@/core/assets'
import { BASE_URL } from '@/core/config'
import { useTeacherLogout } from '@/modules/authentication/api/auth.mutations'
import { useTeacherMe } from '@/modules/authentication/api/auth.queries'

export function Sidebar() {
  const navigate = useNavigate()
  const { sidebarCompact } = useLayout()
  const { data: teacher, isLoading } = useTeacherMe()
  const logoutMutation = useTeacherLogout()
  const name = teacher?.fullName || 'المدرس'
  const email = teacher?.email || '...'
  const avatar = teacher?.profilePictureUrl ? (teacher.profilePictureUrl.startsWith('http') ? teacher.profilePictureUrl : `${BASE_URL}${teacher.profilePictureUrl}`) : AVATAR_PLACEHOLDER
  const handleLogout = async () => {
    try { await logoutMutation.mutateAsync() } finally { localStorage.removeItem('teacher-cpanel-role'); navigate('/login', { replace: true }) }
  }

  return (
    <LayoutSidebar aria-label="القائمة الرئيسية">
      <LayoutSidebarHeader className="bg-neutral-800 text-white">
        <div className="flex min-w-0 flex-1 items-center gap-2.5 group-data-[state=compact]/sidebar:justify-center">
          <Avatar className="size-8 rounded-sm bg-primary"><AvatarImage src={LOGO} alt="Teachedo" /><AvatarFallback><GraduationCap className="size-4 text-white" /></AvatarFallback></Avatar>
          <div className="min-w-0 group-data-[state=compact]/sidebar:hidden"><p className="truncate text-[15px] font-bold leading-5 text-white">EDU-HUB</p><p className="truncate text-[10px] text-white/55">مساحة المدرس</p></div>
        </div>
        <LayoutSidebarTrigger aria-label="تبديل القائمة الجانبية" className="text-white hover:bg-white/10 lg:flex" />
        <LayoutSidebarTrigger aria-label="إغلاق القائمة الجانبية" className="text-white hover:bg-white/10 lg:hidden"><X className="size-4" /></LayoutSidebarTrigger>
      </LayoutSidebarHeader>
      <LayoutSidebarContent aria-label="التنقل" className="bg-neutral-800">
        <LayoutSidebarSection title="مساحة العمل (WORKSPACE)"><LayoutSidebarItem href="/" icon={LayoutDashboard} end>لوحة المتابعة</LayoutSidebarItem></LayoutSidebarSection>
        <LayoutSidebarSection title="الطلاب والمجموعات (ACADEMICS)"><LayoutSidebarItem href="/students" icon={GraduationCap}>إدارة الطلاب</LayoutSidebarItem><LayoutSidebarItem href="/groups" icon={Users}>المجموعات</LayoutSidebarItem><LayoutSidebarItem href="/assistants" icon={UserCheck}>المساعدون</LayoutSidebarItem></LayoutSidebarSection>
      </LayoutSidebarContent>
      <LayoutSidebarFooter className="bg-neutral-800">
        <DropdownMenu align="end" side="left" trigger={<button type="button" className="flex w-full items-center gap-2.5 rounded-sm p-1.5 text-start text-white transition-colors hover:bg-white/10 group-data-[state=compact]/sidebar:justify-center"><Avatar className="size-8 rounded-sm"><AvatarImage src={avatar} alt="" /><AvatarFallback>{name.slice(0, 1)}</AvatarFallback></Avatar><span className="min-w-0 flex-1 group-data-[state=compact]/sidebar:hidden"><span className="block truncate text-[12px] font-semibold">{isLoading ? 'جاري التحميل...' : name}</span><span className="block truncate text-[10px] text-white/50" dir="ltr">{email}</span></span></button>}>
          <div className="mb-1 flex items-center gap-2.5 rounded-sm bg-neutral-100 p-1.5 text-text"><img src={avatar} className="size-8 rounded-sm object-cover" alt="" /><div className="min-w-0"><p className="truncate text-[12px] font-bold">{name}</p><p className="truncate text-[10px] text-text-muted" dir="ltr">{email}</p></div></div>
          <DropdownMenuSeparator /><DropdownMenuItem variant="danger" icon={<LogOut />} onSelect={handleLogout}>تسجيل الخروج</DropdownMenuItem>
        </DropdownMenu>
      </LayoutSidebarFooter>
    </LayoutSidebar>
  )
}
