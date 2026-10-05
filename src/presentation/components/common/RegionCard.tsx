import { MapPin, Rocket, Star } from 'lucide-react'
import type { Region } from '../../../domain/entities'
import { HEALTH_LABELS } from '../../labels'
import { StatusBadge, healthStatusTone } from './StatusBadge'

interface RegionCardProps {
  region: Region
  /** Service id → display name, to list what is deployed in the region. */
  serviceNames?: Record<string, string>
  isSelected?: boolean
  /** Active solution deployed in this region, with the display names of its services. */
  solution?: { name: string; services: string[] }
  onSelect?: (regionId: string) => void
  onSimulateOutage?: (regionId: string) => void
  isSimulating?: boolean
}

export function RegionCard({
  region,
  serviceNames = {},
  isSelected,
  solution,
  onSelect,
  onSimulateOutage,
  isSimulating,
}: RegionCardProps) {
  return (
    <div
      className={`flex animate-fadeInUp flex-col rounded-card border bg-card p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        isSelected ? 'border-brand ring-2 ring-brand/20' : 'border-border'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <MapPin size={16} className="mt-1 shrink-0 text-brand" />
          <div>
            <h3 className="flex items-center gap-1.5 text-base font-semibold text-text-primary">
              {region.name}
              {isSelected && <Star size={14} className="fill-cost text-cost" aria-label="Región principal" />}
            </h3>
            <p className="text-xs text-text-secondary">
              {region.city}, {region.country} · {region.code}
            </p>
          </div>
        </div>
        <StatusBadge label={HEALTH_LABELS[region.status]} tone={healthStatusTone(region.status)} />
      </div>

      {solution && (
        <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-2.5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-brand">
            <Rocket size={13} /> {solution.name}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {solution.services.map((name) => (
              <span key={name} className="rounded-md bg-brand px-2 py-0.5 text-[11px] font-medium text-white">
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="mt-4 text-xs font-medium text-text-secondary">
        Servicios desplegados ({region.servicesDeployed.length})
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {region.servicesDeployed.length === 0 && <span className="text-xs text-text-secondary">Ninguno</span>}
        {region.servicesDeployed.map((serviceId) => (
          <span key={serviceId} className="rounded-md bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand">
            {serviceNames[serviceId] ?? serviceId.toUpperCase()}
          </span>
        ))}
      </div>

      <p className="mt-3 text-xs font-medium text-text-secondary">
        Zonas de disponibilidad ({region.availabilityZones.length})
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {region.availabilityZones.map((az) => (
          <span
            key={az.id}
            className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${
              az.status === 'operational' ? 'bg-security/10 text-security' : 'bg-cost/10 text-cost'
            }`}
          >
            {az.name}
          </span>
        ))}
      </div>

      <p className="mt-3 text-xs text-text-secondary">
        Factor de precio: <span className="font-semibold text-text-primary">×{region.pricingFactor.toFixed(2)}</span>
      </p>

      {(onSelect || onSimulateOutage) && (
        <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
          {onSelect && (
            <button
              type="button"
              onClick={() => onSelect(region.id)}
              disabled={isSelected}
              className="rounded-lg border border-border py-1.5 text-xs font-medium text-text-secondary transition-colors duration-200 hover:border-brand/40 hover:text-brand disabled:cursor-default disabled:border-brand/30 disabled:bg-brand/5 disabled:text-brand"
            >
              {isSelected ? 'Región principal' : 'Usar como principal'}
            </button>
          )}
          {onSimulateOutage && (
            <button
              type="button"
              onClick={() => onSimulateOutage(region.id)}
              disabled={isSimulating || region.status === 'outage'}
              className="rounded-lg border border-border py-1.5 text-xs font-medium text-text-secondary transition-colors duration-200 hover:border-alert/40 hover:text-alert disabled:cursor-not-allowed disabled:opacity-50"
            >
              Simular caída
            </button>
          )}
        </div>
      )}
    </div>
  )
}
