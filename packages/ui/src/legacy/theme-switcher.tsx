import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { IconButton } from './icon-button'

const THEME_KEY = 'portal-theme'

function readTheme() {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(THEME_KEY) === 'dark'
}

export function ThemeSwitcher() {
  const [isDark, setIsDark] = useState(readTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light')
  }, [isDark])

  return (
    <IconButton
      icon={isDark ? <Sun /> : <Moon />}
      aria-label="تغيير المظهر"
      title="تغيير المظهر"
      color="secondary"
      tooltipSide='bottom'
      style="ghost"
      size="md"
      onClick={() => setIsDark((value) => !value)}
    />
  )
}