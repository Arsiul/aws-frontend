import { AlertTriangle, CheckCircle2, CircleDashed, Info, XCircle } from 'lucide-react'

export type BadgeTone = 'success' | 'warning' | 'critical' | 'info' | 'neutral'

interface StatusBadgeProps {
  label: string
  tone: BadgeTone
}

const TONE_STYLES: Record<BadgeTone, string> = {
  success: 'bg-security/10 text-security',
  warning: 'bg-cost/10 text-cost',
  critical: 'bg-alert/10 text-alert',
  info: 'bg-brand/10 text-brand',
  neutral: 'bg-text-secondary/10 text-text-secondary',
}

const TONE_ICONS: Record<BadgeTone, typeof CheckCircle2> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  critical: XCircle,
  info: Info,
  neutral: CircleDashed,
}

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  const Icon = TONE_ICONS[tone]

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium transition-colors duration-200 ${TONE_STYLES[tone]}`}
    >
      <Icon size={13} strokeWidth={2.5} />
      {label}
    </span>
  )
}

export function healthStatusTone(status: 'operational' | 'degraded' | 'outage'): BadgeTone {
  if (status === 'operational') return 'success'
  if (status === 'degraded') return 'warning'
  return 'critical'
}

export function securityStatusTone(status: 'ok' | 'warning' | 'critical'): BadgeTone {
  if (status === 'ok') return 'success'
  if (status === 'warning') return 'warning'
  return 'critical'
}

export function utilizationStatusTone(status: 'active' | 'inactive' | 'recommended'): BadgeTone {
  if (status === 'active') return 'success'
  if (status === 'recommended') return 'warning'
  return 'neutral'
}
