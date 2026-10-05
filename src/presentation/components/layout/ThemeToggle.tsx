import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/theme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors duration-200 hover:bg-background hover:text-brand"
    >
      <span key={theme} className="animate-scaleIn">
        {isDark ? <Sun size={19} /> : <Moon size={19} />}
      </span>
    </button>
  )
}
