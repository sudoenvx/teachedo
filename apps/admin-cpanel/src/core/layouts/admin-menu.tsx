import { BookText, CreditCard, LifeBuoy } from 'lucide-react'
import {
  AccountMenuHeader,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  ThemeModeToggle,
} from '@teachedo/ui/components'

export function AdminMenu() {
  const name = 'أحمد'
  const email = 'ahmed@teachedo.app'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex size-7 items-center justify-center rounded-full transition-opacity hover:opacity-80">
        <Avatar className="size-7">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback className="text-[10px] font-bold">{name.slice(0, 1)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={10} className="w-64 border border-border-subtle bg-surface p-0 shadow-elevated">
        <AccountMenuHeader name={name} email={email} avatarSrc="https://github.com/shadcn.png" onSettingsClick={() => {}} />

        <DropdownMenuSeparator className="m-0" />

        <DropdownMenuGroup className="p-1.5">
          <DropdownMenuItem>
            <CreditCard className="size-4" /> الفوترة والإيرادات
          </DropdownMenuItem>
          <DropdownMenuItem>
            <BookText className="size-4" /> سجل التحديثات
          </DropdownMenuItem>
          <DropdownMenuItem>
            <LifeBuoy className="size-4" /> الدعم الفني
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="m-0" />

        <div className="flex items-center justify-between p-1.5">
          <ThemeModeToggle />
          <Button variant="destructive" size="sm" className="font-medium text-xs/3 rounded-[calc(var(--radius-md)-3px)]">
            تسجيل الخروج
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}