import {
  Activity,
  Cloud,
  Cpu,
  Database,
  Globe,
  HardDrive,
  Key,
  Network,
  Server,
  Shield,
  Zap,
  type LucideIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  Server,
  HardDrive,
  Database,
  Key,
  Network,
  Globe,
  Zap,
  Cpu,
  Activity,
  Shield,
}

export function resolveIcon(name: string): LucideIcon {
  return ICONS[name] ?? Cloud
}
