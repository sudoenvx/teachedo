import { Settings } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@teachedo/ui/components'

type AccountMenuHeaderProps = {
  name: string
  email: string
  avatarSrc?: string
  onSettingsClick?: () => void
}

export function AccountMenuHeader({ name, email, avatarSrc, onSettingsClick }: AccountMenuHeaderProps) {
  return (
    <div className="flex items-center gap-2.5 p-2.5">
      <Avatar className="size-9">
        <AvatarImage src={avatarSrc} />
        <AvatarFallback className="text-xs font-bold">{name.slice(0, 1)}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold text-text">{name}</p>
        <p className="truncate text-[11px] text-text-muted">
          {email}
        </p>
      </div>

      {onSettingsClick && (
        <button
          type="button"
          aria-label="الإعدادات"
          onClick={onSettingsClick}
          className="flex size-7 shrink-0 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-neutral-100 hover:text-text"
        >
          <Settings className="size-4" strokeWidth={1.8} />
        </button>
      )}
    </div>
  )
}