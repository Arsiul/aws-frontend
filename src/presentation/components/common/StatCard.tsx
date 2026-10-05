import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  icon: LucideIcon
  accent?: 'brand' | 'security' | 'cost' | 'alert'
  hint?: string
}

const ACCENT_STYLES: Record<NonNullable<StatCardProps['accent']>, string> = {
  brand: 'bg-brand/10 text-brand',
  security: 'bg-security/10 text-security',
  cost: 'bg-cost/10 text-cost',
  alert: 'bg-alert/10 text-alert',
}

export function StatCard({ label, value, icon: Icon, accent = 'brand', hint }: StatCardProps) {
  return (
    <div className="animate-fadeInUp rounded-card border border-border bg-card p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-text-secondary">{label}</p>
          <p className="mt-2 break-words text-2xl font-bold leading-tight text-text-primary">{value}</p>
          {hint && <p className="mt-1 text-xs text-text-secondary">{hint}</p>}
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 ${ACCENT_STYLES[accent]}`}
        >
          <Icon size={20} strokeWidth={2.2} />
        </div>
      </div>
    </div>
  )
}
