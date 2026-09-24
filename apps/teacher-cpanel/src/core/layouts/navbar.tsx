import { ChevronDown, GraduationCap, Plus, UserCheck, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  ButtonGroup,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  LayoutSidebarTrigger,
} from '@teachedo/ui/components'
import { TeacherDropdownMenu } from './teacher-menu'

export function Navbar() {
  const navigate = useNavigate()

  return (
    <>
      <LayoutSidebarTrigger aria-label="تبديل القائمة الجانبية" />

      <h1 className="min-w-0 shrink-0 truncate text-sm font-semibold uppercase text-primary">
        Teachedo Workspace
      </h1>

      <div className="ms-auto flex items-center gap-1">
        <ButtonGroup aria-label="إضافة جديد">
          <Button variant={"neutral"} className="rounded-e-none" onClick={() => navigate('/students/new')}>
            <Plus />
            إضافة طالب
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant={"neutral"}
                  aria-label="خيارات الإضافة"
                  className="px-1.5"
                />
              }
            >
              <ChevronDown />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8}>
              <DropdownMenuItem onClick={() => navigate('/students/new')}>
                <GraduationCap /> طالب جديد
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/groups/new')}>
                <Users /> مجموعة جديدة
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/assistants')}>
                <UserCheck /> إدارة المساعدين
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>

        <TeacherDropdownMenu />
      </div>
    </>
  )
}
