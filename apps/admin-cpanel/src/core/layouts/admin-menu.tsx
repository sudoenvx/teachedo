import { LogOut, Settings, User } from 'lucide-react'
import {
    Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@teachedo/ui/components'

export function AdminMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex size-7 items-center justify-center rounded-md bg-white/10 text-[11px] font-bold text-neutral-200 transition-colors hover:bg-white/20">
        <Avatar>
            <AvatarImage src='https://github.com/shadcn.png' />
            <AvatarFallback>
                
            </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-48">
        <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs text-text-muted">أحمد — مالك النظام</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="size-4" /> الملف الشخصي
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="size-4" /> الإعدادات
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive ">
          <LogOut className="size-4" /> تسجيل الخروج
        </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}