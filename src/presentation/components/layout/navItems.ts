import {
  ClipboardList,
  Cloud,
  DollarSign,
  Globe2,
  LayoutDashboard,
  Network,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/planning', label: 'Planificación Cloud', icon: ClipboardList },
  { to: '/costs', label: 'Costos', icon: DollarSign },
  { to: '/infrastructure', label: 'Infraestructura Global', icon: Globe2 },
  { to: '/security', label: 'Seguridad', icon: ShieldCheck },
  { to: '/network', label: 'Arquitectura de Red', icon: Network },
  { to: '/services', label: 'Servicios AWS', icon: Cloud },
]
