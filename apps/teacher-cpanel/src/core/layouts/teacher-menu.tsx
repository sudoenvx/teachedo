import { Check, Gift, GraduationCap, LogOut, Sparkles, Wallet } from 'lucide-react'
import {
  AccountMenuHeader,
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  ThemeModeToggle,
} from '@teachedo/ui/components'

type Branch = { id: string; label: string; icon: 'online' | 'center' }

const branches: Branch[] = [
  { id: 'online', label: 'التعليم عبر الإنترنت', icon: 'online' },
  { id: 'center-1', label: 'سنتر النور', icon: 'center' },
]

export function TeacherDropdownMenu() {
  const name = 'محمد صلاح'
  const email = 'mohamedsalah@gmail.com'
  const activeBranchId = 'online'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={name}
            className="rounded-full transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          />
        }
      >
        <Avatar size="default">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback className="text-[10px] font-bold">{name.slice(0, 1)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={10} className="w-64 border border-border-subtle bg-surface p-0 shadow-elevated">
        <AccountMenuHeader name={name} email={email} avatarSrc="https://github.com/shadcn.png" onSettingsClick={() => {}} />

        <DropdownMenuSeparator className="m-0" />

        <div className="p-1.5">
          <p className="px-2 pb-1 pt-0.5 text-[10px] font-bold tracking-wide text-text-faint">أماكن التدريس</p>
          <DropdownMenuGroup>
            {branches.map((branch) => (
              <DropdownMenuItem key={branch.id}>
                <span className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-neutral-100 text-text-muted">
                  <GraduationCap className="size-3.5" strokeWidth={1.8} />
                </span>
                <span className="flex-1 truncate">{branch.label}</span>
                {branch.id === activeBranchId && <Check className="size-4 text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </div>

        <DropdownMenuSeparator className="m-0" />

        <DropdownMenuGroup className="p-1.5">
          <DropdownMenuItem>
            <Wallet className="size-4" /> الاشتراك والفوترة
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Sparkles className="size-4" /> سجل التحديثات
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Gift className="size-4" /> ادعُ معلمًا واربح
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="m-0" />

        <div className="flex items-center justify-between p-1.5">
          <ThemeModeToggle />
          <DropdownMenuItem className="text-destructive focus:text-destructive">
            <LogOut className="size-4" /> تسجيل الخروج
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}