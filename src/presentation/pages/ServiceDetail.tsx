import { ArrowLeft, CheckCircle2, DollarSign, Globe2, Lightbulb, Target } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { formatCurrency } from '../../shared/utils/format'
import { ErrorState, LoadingState } from '../components/common/AsyncState'
import { Panel } from '../components/common/Panel'
import { ServiceIcon } from '../components/common/ServiceIcon'
import { StatusBadge, healthStatusTone, utilizationStatusTone } from '../components/common/StatusBadge'
import { useServiceDetail } from '../hooks/useServiceDetail'
import { HEALTH_LABELS, SERVICE_CATEGORY_LABELS, UTILIZATION_LABELS } from '../labels'

export function ServiceDetail() {
  const { serviceId = '' } = useParams()
  const { data: detail, isLoading, error } = useServiceDetail(serviceId)

  if (isLoading) return <LoadingState label="Cargando servicio…" />
  if (error) return <ErrorState message={error} />

  if (!detail) {
    return (
      <div className="space-y-4">
        <BackLink />
        <ErrorState message={`No existe el servicio "${serviceId}" en el catálogo.`} />
      </div>
    )
  }

  const { service, deployedRegions, monthlyCost } = detail

  return (
    <div className="space-y-6">
      <BackLink />

      <div className="flex flex-col gap-4 rounded-card border border-border bg-card p-6 shadow-card sm:flex-row sm:items-center">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand">
          <ServiceIcon name={service.icon} size={32} strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            {SERVICE_CATEGORY_LABELS[service.category]}
          </p>
          <h1 className="text-[28px] font-bold leading-tight tracking-tight text-text-primary sm:text-[32px]">
            {service.name}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">{service.description}</p>
        </div>
        <StatusBadge label={UTILIZATION_LABELS[service.status]} tone={utilizationStatusTone(service.status)} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel title="Función principal" icon={Target} className="lg:col-span-2">
          <p className="text-base font-medium text-text-primary">{service.mainFunction}</p>
          <h3 className="mt-5 text-sm font-semibold text-text-primary">Características clave</h3>
          <ul className="mt-2 space-y-2">
            {service.keyFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-text-secondary">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-security" />
                {feature}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Costo" icon={DollarSign} iconClassName="text-cost">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-background p-3">
              <p className="text-[11px] uppercase tracking-wide text-text-secondary">Por hora</p>
              <p className="mt-1 text-lg font-bold text-text-primary">
                {service.hourlyCost ? formatCurrency(service.hourlyCost, 4) : 'Sin costo'}
              </p>
            </div>
            <div className="rounded-lg bg-background p-3">
              <p className="text-[11px] uppercase tracking-wide text-text-secondary">Mensual (730 h)</p>
              <p className="mt-1 text-lg font-bold text-cost">{formatCurrency(monthlyCost, 2)}</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-text-secondary">{service.pricingModel}</p>
          <Link to="/costs" className="mt-3 inline-block text-sm font-medium text-brand hover:underline">
            Estimar en la calculadora →
          </Link>
        </Panel>

        <Panel title="Casos de uso" icon={Lightbulb} iconClassName="text-cost" className="lg:col-span-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {service.useCases.map((useCase) => (
              <div key={useCase} className="rounded-lg border border-border bg-background p-3 text-sm text-text-primary">
                {useCase}
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Regiones donde está desplegado" icon={Globe2}>
          {deployedRegions.length === 0 ? (
            <p className="text-sm text-text-secondary">
              Servicio global o aún no desplegado en ninguna región de la solución.
            </p>
          ) : (
            <ul className="space-y-2">
              {deployedRegions.map((region) => (
                <li key={region.id} className="flex items-center justify-between gap-2 text-sm">
                  <span>
                    <span className="font-medium text-text-primary">{region.name}</span>{' '}
                    <span className="text-xs text-text-secondary">{region.code}</span>
                  </span>
                  <StatusBadge label={HEALTH_LABELS[region.status]} tone={healthStatusTone(region.status)} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  )
}

function BackLink() {
  return (
    <Link to="/services" className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-brand">
      <ArrowLeft size={16} /> Volver al catálogo
    </Link>
  )
}
