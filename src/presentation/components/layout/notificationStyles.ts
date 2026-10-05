import { AlertTriangle, CheckCircle2, Info, XCircle, type LucideIcon } from 'lucide-react'
import type { NotificationTone } from '../../context/notifications'

export const NOTIFICATION_ICONS: Record<NotificationTone, LucideIcon> = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  critical: XCircle,
}

export const NOTIFICATION_COLORS: Record<NotificationTone, string> = {
  success: 'bg-security/10 text-security',
  info: 'bg-brand/10 text-brand',
  warning: 'bg-cost/10 text-cost',
  critical: 'bg-alert/10 text-alert',
}
