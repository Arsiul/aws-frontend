import { DollarSign, Trash2 } from 'lucide-react'
import type { CostLineItem } from '../../../domain/entities'
import { formatCurrency } from '../../../shared/utils/format'

interface CostCardProps {
  item: CostLineItem
  onRemove?: () => void
}

export function CostCard({ item, onRemove }: CostCardProps) {
  return (
    <div className="animate-fadeInUp rounded-card border border-border bg-card p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cost/10 text-cost">
            <DollarSign size={16} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-text-primary">{item.serviceName}</h3>
            <p className="text-xs text-text-secondary">
              {item.quantity} unidad(es) × {item.estimatedHours} h/mes · {formatCurrency(item.unitCost, 4)}/h c/u
            </p>
          </div>
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Quitar ${item.serviceName}`}
            className="rounded-lg p-1.5 text-text-secondary transition-colors duration-200 hover:bg-alert/10 hover:text-alert print:hidden"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-text-secondary">Estimado / h</p>
          <p className="mt-1 text-sm font-bold text-text-primary">{formatCurrency(item.hourlyCost, 3)}</p>
        </div>
        <div className="border-x border-border">
          <p className="text-[11px] uppercase tracking-wide text-text-secondary">Mensual</p>
          <p className="mt-1 text-sm font-bold text-cost">{formatCurrency(item.monthlyCost, 2)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-text-secondary">Anual</p>
          <p className="mt-1 text-sm font-bold text-text-primary">{formatCurrency(item.annualCost)}</p>
        </div>
      </div>
    </div>
  )
}
