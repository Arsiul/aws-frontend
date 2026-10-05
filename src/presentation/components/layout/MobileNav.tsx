import { Cloud, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from './navItems'
import { RegionSelector } from './RegionSelector'

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const [isMounted, setIsMounted] = useState(isOpen)

  useEffect(() => {
    if (isOpen) setIsMounted(true)
  }, [isOpen])

  if (!isMounted) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden print:hidden">
      <div
        className={`absolute inset-0 bg-slate-900/50 transition-opacity duration-200 ease-out ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        onTransitionEnd={() => {
          if (!isOpen) setIsMounted(false)
        }}
        className={`absolute inset-y-0 left-0 flex w-72 flex-col bg-sidebar text-white shadow-xl transition-transform duration-200 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand">
              <Cloud size={18} strokeWidth={2.4} />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">CloudOps</p>
              <p className="text-xs leading-tight text-slate-400">Dashboard</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition-colors duration-200 hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-3 pb-2 md:hidden">
          <p className="mb-1.5 px-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">Región principal</p>
          <RegionSelector variant="sidebar" />
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                  isActive ? 'bg-brand text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={18} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </div>
  )
}
