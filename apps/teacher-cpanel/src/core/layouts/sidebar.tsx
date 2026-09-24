import {
  Building2,
  GraduationCap,
  LayoutDashboard,
  Sparkles,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  LayoutSidebar,
  LayoutSidebarContent,
  LayoutSidebarFooter,
  LayoutSidebarHeader,
  LayoutSidebarItem,
  LayoutSidebarSection,
  LayoutSidebarTrigger,
} from "@teachedo/ui/components";
import { TeacherDropdownMenu } from "@/core/layouts/teacher-menu";

export function Sidebar() {
  return (
    <LayoutSidebar aria-label="القائمة الرئيسية">
      <LayoutSidebarHeader className="p-2">
        <div className="relative flex min-w-0 flex-1 items-center gap-2.5 overflow-hidden rounded-[calc(var(--radius-lg)-3px)]  bg-neutral-700 p-1.5 group-data-[state=compact]/sidebar:flex-col group-data-[state=compact]/sidebar:gap-1.5">

          <Avatar className="relative size-8 rounded-[calc(var(--radius-lg)-6px)] bg-accent text-accent-foreground  group-data-[state=compact]/sidebar:size-8">
            <AvatarFallback className="rounded-lg bg-accent text-accent-foreground">
              <GraduationCap className="size-5" />
            </AvatarFallback>
          </Avatar>
          <div className="relative min-w-0 flex-1 group-data-[state=compact]/sidebar:hidden">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-[14px] font-medium font-inter leading-5 text-white">
                TEACHEDO
              </p>
              {/* <Sparkles className="size-3 shrink-0 text-accent" /> */}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-neutral-300">
              <Building2 className="size-3 shrink-0" />
              <span className="truncate">مساحة المدرس</span>
            </div>
          </div>
        </div>
        <LayoutSidebarTrigger
          aria-label="إغلاق القائمة الجانبية"
          className="h-6.5 w-6.5 bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-neutral-50 lg:hidden"
        >
          <X className="size-4" />
        </LayoutSidebarTrigger>
      </LayoutSidebarHeader>

      <LayoutSidebarContent aria-label="التنقل">
        <LayoutSidebarSection title="مساحة العمل (WORKSPACE)">
          <LayoutSidebarItem href="/" icon={LayoutDashboard} end>
            لوحة المتابعة
          </LayoutSidebarItem>
        </LayoutSidebarSection>
        <LayoutSidebarSection title="الطلاب والمجموعات (ACADEMICS)">
          <LayoutSidebarItem href="/students" icon={GraduationCap}>
            إدارة الطلاب
          </LayoutSidebarItem>
          <LayoutSidebarItem href="/groups" icon={Users}>
            المجموعات
          </LayoutSidebarItem>
          <LayoutSidebarItem href="/centers" icon={Building2}>
            السناتر
          </LayoutSidebarItem>
          <LayoutSidebarItem href="/assistants" icon={UserCheck}>
            المساعدون
          </LayoutSidebarItem>
        </LayoutSidebarSection>
      </LayoutSidebarContent>

      <LayoutSidebarFooter>
        <TeacherDropdownMenu />
      </LayoutSidebarFooter>
    </LayoutSidebar>
  );
}
