import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CloudService } from '../../../domain/entities'
import { SERVICE_CATEGORY_LABELS, UTILIZATION_LABELS } from '../../labels'
import { ServiceIcon } from './ServiceIcon'
import { StatusBadge, utilizationStatusTone } from './StatusBadge'

interface ServiceCardProps {
  service: CloudService
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Link
      to={`/services/${service.id}`}
      className="group flex h-full animate-fadeInUp flex-col gap-3 rounded-card border border-border bg-card p-5 text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <ServiceIcon name={service.icon} size={20} strokeWidth={2.2} />
        </div>
        <StatusBadge label={UTILIZATION_LABELS[service.status]} tone={utilizationStatusTone(service.status)} />
      </div>

      <div>
        <h3 className="text-base font-semibold text-text-primary">{service.name}</h3>
        <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
          {SERVICE_CATEGORY_LABELS[service.category]}
        </p>
      </div>

      <p className="text-sm text-text-secondary">{service.description}</p>

      <div className="mt-auto flex items-end justify-between gap-2 border-t border-border pt-3 text-xs text-text-secondary">
        <span>
          <span className="font-medium text-text-primary">Función: </span>
          {service.mainFunction}
        </span>
        <ArrowRight
          size={16}
          className="shrink-0 text-brand opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
        />
      </div>
    </Link>
  )
}
