import { Database, FileCheck2, KeyRound, Scale, ShieldCheck } from 'lucide-react'
import type { SecurityCheckItem } from '../../../domain/entities'
import { SECURITY_CATEGORY_LABELS, SECURITY_STATUS_LABELS } from '../../labels'
import { StatusBadge, securityStatusTone } from './StatusBadge'

const CATEGORY_ICONS: Record<SecurityCheckItem['category'], typeof ShieldCheck> = {
  'shared-responsibility': Scale,
  iam: KeyRound,
  'account-protection': ShieldCheck,
  'data-protection': Database,
  compliance: FileCheck2,
}

const STATUS_BORDER: Record<SecurityCheckItem['status'], string> = {
  ok: 'border-l-security',
  warning: 'border-l-cost',
  critical: 'border-l-alert',
}

interface SecurityCardProps {
  item: SecurityCheckItem
}

export function SecurityCard({ item }: SecurityCardProps) {
  const Icon = CATEGORY_ICONS[item.category]

  return (
    <div
      className={`animate-fadeInUp rounded-card border border-l-4 border-border bg-card p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${STATUS_BORDER[item.status]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <Icon size={16} strokeWidth={2} />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-text-secondary">
              {SECURITY_CATEGORY_LABELS[item.category]}
            </p>
            <h3 className="mt-1 text-base font-semibold text-text-primary">{item.title}</h3>
          </div>
        </div>
        <StatusBadge label={SECURITY_STATUS_LABELS[item.status]} tone={securityStatusTone(item.status)} />
      </div>
      <p className="mt-3 text-sm text-text-secondary">{item.description}</p>
    </div>
  )
}
