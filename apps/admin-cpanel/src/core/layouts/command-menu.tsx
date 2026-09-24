import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHotkey, formatForDisplay } from '@tanstack/react-hotkeys'
import { Building2, CreditCard, HardDrive, Search, Settings, UserPlus } from 'lucide-react'
import {
    Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  Kbd,
} from '@teachedo/ui/components'

const SHORTCUT = 'Mod+K'

export function useCommandMenuTrigger() {
  const [open, setOpen] = useState(false)

  useHotkey(
    SHORTCUT,
    () => setOpen((prev) => !prev),
    { preventDefault: true }
  )

  return { open, setOpen, shortcutLabel: formatForDisplay(SHORTCUT) }
}

type CommandMenuProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const navigate = useNavigate()

  const go = (path: string) => {
    navigate(path)
    onOpenChange(false)
  }

  return (
        <CommandDialog open={open} onOpenChange={onOpenChange}>
    <Command>
      <CommandInput placeholder="ابحث عن مستأجر، معلم، أو انتقل إلى صفحة..." />
      <CommandList>
        <CommandEmpty>لا توجد نتائج مطابقة.</CommandEmpty>

        <CommandGroup heading="إجراءات سريعة">
          <CommandItem onSelect={() => go('/tenants/new')}>
            <UserPlus className="size-4" />
            <span>إضافة معلم جديد</span>
          </CommandItem>
          <CommandItem onSelect={() => go('/billing')}>
            <CreditCard className="size-4" />
            <span>مراجعة الفواتير والاشتراكات</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="الانتقال إلى">
          <CommandItem onSelect={() => go('/tenants')}>
            <Building2 className="size-4" />
            <span>المعلمون (المستأجرون)</span>
          </CommandItem>
          <CommandItem onSelect={() => go('/usage')}>
            <HardDrive className="size-4" />
            <span>التخزين والاستخدام</span>
          </CommandItem>
          <CommandItem onSelect={() => go('/settings')}>
            <Settings className="size-4" />
            <span>الإعدادات العامة</span>
            <CommandShortcut>⌘,</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
    </CommandDialog>
  )
}

/** The fake-input trigger that sits in the navbar. */
export function CommandMenuTrigger({
  onClick,
  shortcutLabel,
}: {
  onClick: () => void
  shortcutLabel: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-7 w-full max-w-64 items-center gap-2 rounded-sm bg-neutral-200/60 px-1 text-[12px] transition-colors hover:border-neutral-300 "
    >
      <Search className="size-3.5 shrink-0" strokeWidth={1.8} />
      <span className="flex-1 text-start text-xs/relaxed">بحث سريع</span>
      <Kbd className="rounded-xs px-2 py-0.5 font-mono text-[10px]">
        {shortcutLabel}
      </Kbd>
    </button>
  )
}