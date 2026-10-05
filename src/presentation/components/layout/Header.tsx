import { Menu, UserCircle2 } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { NAV_ITEMS } from './navItems'
import { NotificationCenter } from './NotificationCenter'
import { RegionSelector } from './RegionSelector'
import { ThemeToggle } from './ThemeToggle'

interface HeaderProps {
  onOpenMobileNav: () => void
}

export function Header({ onOpenMobileNav }: HeaderProps) {
  const location = useLocation()
  const currentItem = NAV_ITEMS.find((item) => location.pathname.startsWith(item.to))

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4 sm:px-6 print:hidden">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Abrir menú"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-secondary transition-colors duration-200 hover:bg-background lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <p className="truncate text-xs text-text-secondary">
            CloudOps <span className="mx-1">/</span>
            <span className="font-semibold text-text-primary">{currentItem?.label ?? 'Dashboard'}</span>
          </p>
          <p className="hidden truncate text-xs text-text-secondary sm:block">
            Planificación y análisis de infraestructura Cloud
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <RegionSelector className="hidden w-60 md:flex" />
        <div className="hidden items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text-secondary xl:flex">
          <span className="h-2 w-2 rounded-full bg-security" />
          Entorno de simulación
        </div>
        <ThemeToggle />
        <NotificationCenter />
        <UserCircle2 size={30} className="hidden text-text-secondary sm:block" strokeWidth={1.5} />
      </div>
    </header>
  )
}
