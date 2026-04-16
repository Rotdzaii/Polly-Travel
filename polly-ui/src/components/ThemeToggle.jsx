import { Moon, Sun } from 'lucide-react'
import { useTheme } from './theme-provider'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isLight = theme === 'light'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-app-border bg-[color:color-mix(in_oklch,var(--color-app-card)_96%,transparent)] text-app-text transition duration-300 hover:scale-105 hover:border-cyan-400/70"
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      title={isLight ? 'Dark mode' : 'Light mode'}
    >
      {isLight ? <Moon className="h-5 w-5 text-cyan-500" /> : <Sun className="h-5 w-5 text-cyan-400" />}
    </button>
  )
}
