import { Calculator, Clock, Eraser, FileDown, Info, ListPlus, PieChart, Plus, TrendingUp, Wallet } from 'lucide-react'
import { useState } from 'react'
import type { CostEstimateRequest } from '../../domain/repositories'
import { HOURS_PER_MONTH } from '../../domain/pricing'
import { downloadFile } from '../../shared/utils/download'
import { formatCurrency, isoDateStamp } from '../../shared/utils/format'
import { CostDistributionChart } from '../components/charts/CostDistributionChart'
import { ErrorState, LoadingState } from '../components/common/AsyncState'
import { CostCard } from '../components/common/CostCard'
import { FormField } from '../components/common/FormField'
import { PageHeader } from '../components/common/PageHeader'
import { Panel } from '../components/common/Panel'
import { StatCard } from '../components/common/StatCard'
import { useNotifications } from '../context/notifications'
import { useSelectedRegion } from '../context/selectedRegion'
import { costEstimateToCsv } from '../export/reportCsv'
import { useCostCatalog, useCostEstimate } from '../hooks/useCostEstimate'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import { useRegions } from '../hooks/useRegions'

export function Costs() {
  const { selectedRegionId } = useSelectedRegion()
  const { notify } = useNotifications()
  const { data: catalog, isLoading, error } = useCostCatalog()
  const { data: regions } = useRegions()
  const [requests, setRequests] = useLocalStorageState<CostEstimateRequest[]>('cloudops.cost-requests', [])
  const items = useCostEstimate(requests, selectedRegionId)
  const [draft, setDraft] = useState({ serviceId: '', quantity: 1, estimatedHours: HOURS_PER_MONTH })

  if (isLoading) return <LoadingState label="Cargando catálogo de costos…" />
  if (error) return <ErrorState message={error} />

  const region = regions?.find((r) => r.id === selectedRegionId)
  const regionLabel = region ? `${region.name} (${region.code})` : selectedRegionId
  const serviceId = draft.serviceId || catalog?.[0]?.serviceId || ''
  const isDraftValid =
    Boolean(serviceId) && draft.quantity >= 1 && draft.estimatedHours >= 1 && draft.estimatedHours <= HOURS_PER_MONTH

  const addLineItem = () => {
    if (!isDraftValid) return
    setRequests((prev) => [...prev, { ...draft, serviceId }])
  }

  const removeLineItem = (index: number) => {
    setRequests((prev) => prev.filter((_, i) => i !== index))
  }

  const exportCsv = () => {
    downloadFile(`cloudops-costos-${isoDateStamp()}.csv`, costEstimateToCsv(items, regionLabel))
    notify({ tone: 'success', title: 'Estimación exportada', message: `${items.length} servicio(s) en ${regionLabel}.` })
  }

  const totalHourly = items.reduce((sum, item) => sum + item.hourlyCost, 0)
  const totalMonthly = items.reduce((sum, item) => sum + item.monthlyCost, 0)
  const totalAnnual = items.reduce((sum, item) => sum + item.annualCost, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Calculator}
        title="Costos y economía Cloud"
        description="Estimación simulada con pago por uso: precio por hora × cantidad × horas de uso al mes."
        action={
          items.length > 0 && (
            <>
              <button type="button" onClick={() => setRequests([])} className="btn-secondary">
                <Eraser size={16} /> Vaciar
              </button>
              <button type="button" onClick={exportCsv} className="btn-primary">
                <FileDown size={16} /> Exportar CSV
              </button>
            </>
          )
        }
      />

      <Panel title="Agregar servicio a la estimación" icon={ListPlus}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto] lg:items-end">
          <FormField label="Servicio">
            <select
              value={serviceId}
              onChange={(e) => setDraft((d) => ({ ...d, serviceId: e.target.value }))}
              className="input"
            >
              {catalog?.map((item) => (
                <option key={item.serviceId} value={item.serviceId}>
                  {item.serviceName} (${item.hourlyCost}/h)
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Cantidad (instancias / unidades)">
            <input
              type="number"
              min={1}
              value={draft.quantity}
              onChange={(e) => setDraft((d) => ({ ...d, quantity: Number(e.target.value) }))}
              className="input"
            />
          </FormField>

          <FormField label={`Horas estimadas al mes (máx. ${HOURS_PER_MONTH})`}>
            <input
              type="number"
              min={1}
              max={HOURS_PER_MONTH}
              value={draft.estimatedHours}
              onChange={(e) => setDraft((d) => ({ ...d, estimatedHours: Number(e.target.value) }))}
              className="input"
            />
          </FormField>

          <button type="button" onClick={addLineItem} disabled={!isDraftValid} className="btn-primary h-[38px]">
            <Plus size={16} /> Agregar
          </button>
        </div>

        <p className="mt-4 flex items-start gap-2 rounded-lg bg-brand/5 p-3 text-xs text-text-secondary">
          <Info size={14} className="mt-0.5 shrink-0 text-brand" />
          <span>
            Precios para la región <span className="font-semibold text-text-primary">{regionLabel}</span>
            {region && <> con factor ×{region.pricingFactor.toFixed(2)} respecto a us-east-1</>}. Cambia la región
            desde la barra superior para comparar. {HOURS_PER_MONTH} h equivalen a un mes encendido 24/7.
          </span>
        </p>
      </Panel>

      {items.length === 0 && (
        <p className="rounded-card border border-dashed border-border p-8 text-center text-sm text-text-secondary">
          Agrega uno o más servicios para calcular el costo mensual, el anual y su distribución.
        </p>
      )}

      {items.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Costo estimado por hora" value={formatCurrency(totalHourly, 3)} icon={Clock} accent="brand" />
            <StatCard label="Costo mensual total" value={formatCurrency(totalMonthly, 2)} icon={Wallet} accent="cost" />
            <StatCard label="Costo anual total" value={formatCurrency(totalAnnual)} icon={TrendingUp} accent="cost" />
          </div>

          <Panel
            title="Distribución de costos por servicio"
            icon={PieChart}
            description="Pasa el cursor o haz clic en un servicio para ver su participación."
          >
            <CostDistributionChart items={items} />
          </Panel>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item, index) => (
              <CostCard key={item.id} item={item} onRemove={() => removeLineItem(index)} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
