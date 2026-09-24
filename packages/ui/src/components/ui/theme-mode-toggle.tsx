import { Monitor, Moon, Sun } from 'lucide-react'
import { cn } from 'cn'
import { useThemeMode } from '../../hooks/use-theme-mode'

const OPTIONS = [
  { value: 'light' as const, icon: Sun, label: 'فاتح' },
  { value: 'dark' as const, icon: Moon, label: 'داكن' },
  { value: 'system' as const, icon: Monitor, label: 'النظام' },
]

export function ThemeModeToggle() {
  const { mode, setMode } = useThemeMode()

  return (
    <div className="flex items-center gap-0.5 rounded-md bg-neutral-100 p-0.5">
      {OPTIONS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          aria-label={label}
          onClick={() => setMode(value)}
          className={cn(
            'flex size-6 items-center justify-center rounded-sm transition-colors',
            mode === value
              ? 'bg-surface text-text shadow-card'
              : 'text-text-faint hover:text-text-muted'
          )}
        >
          <Icon className="size-3.5" strokeWidth={1.8} />
        </button>
      ))}
    </div>
  )
}