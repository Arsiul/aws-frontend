import {
  Activity,
  BarChart3,
  Boxes,
  ClipboardList,
  CloudCog,
  DollarSign,
  FileDown,
  LayoutDashboard,
  MapPin,
  Printer,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { downloadFile } from '../../shared/utils/download'
import { formatCurrency, isoDateStamp } from '../../shared/utils/format'
import { CostByCategoryChart } from '../components/charts/CostByCategoryChart'
import { CostTrendChart } from '../components/charts/CostTrendChart'
import { ErrorState, LoadingState } from '../components/common/AsyncState'
import { PageHeader } from '../components/common/PageHeader'
import { SolutionBanner } from '../components/common/SolutionBanner'
import { Panel } from '../components/common/Panel'
import { ServiceIcon } from '../components/common/ServiceIcon'
import { StatCard } from '../components/common/StatCard'
import { StatusBadge, healthStatusTone, securityStatusTone } from '../components/common/StatusBadge'
import { useActiveSolution } from '../context/activeSolution'
import { useNotifications } from '../context/notifications'
import { useSelectedRegion } from '../context/selectedRegion'
import { cloudReportToCsv } from '../export/reportCsv'
import { useCloudReport } from '../hooks/useCloudReport'
import { useCloudServices } from '../hooks/useCloudServices'
import { useDashboardSummary } from '../hooks/useDashboardSummary'
import { useSecurityChecks } from '../hooks/useSecurityChecks'
import { ARCHITECTURE_LABELS, HEALTH_LABELS, shortServiceName } from '../labels'

export function Dashboard() {
  const { selectedRegionId } = useSelectedRegion()
  const { data: summary, error } = useDashboardSummary(selectedRegionId)
  const { data: securityChecks } = useSecurityChecks()
  const { data: services } = useCloudServices()
  const { proposals } = useActiveSolution()
  const { generate, isGenerating } = useCloudReport()
  const { notify } = useNotifications()
  const navigate = useNavigate()

  // Error first: on failure summary stays null and would otherwise spin forever.
  if (error) return <ErrorState message={error} />
  if (!summary) return <LoadingState label="Cargando resumen del dashboard…" />

  const criticalChecks = securityChecks?.filter((c) => c.status === 'critical') ?? []
  const warningChecks = securityChecks?.filter((c) => c.status === 'warning') ?? []
  const usedServices = services?.filter((s) => summary.usedServiceIds.includes(s.id)) ?? []
  const solution = summary.solution
  const scoreTone = summary.securityScore >= 80 ? 'success' : summary.securityScore >= 50 ? 'warning' : 'critical'
  const scoreBar = { success: 'bg-security', warning: 'bg-cost', critical: 'bg-alert' }[scoreTone]

  const exportCsv = async () => {
    try {
      const report = await generate(selectedRegionId)
      downloadFile(`cloudops-reporte-${isoDateStamp()}.csv`, cloudReportToCsv(report))
      notify({ tone: 'success', title: 'Reporte exportado', message: 'Se descargó el CSV con el resumen de la solución.' })
    } catch {
      notify({ tone: 'critical', title: 'No se pudo exportar el reporte' })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        description={
          solution
            ? `Resumen de "${solution.name}": costos, región, seguridad y estado calculados con tus datos.`
            : 'Resumen general de la solución Cloud propuesta para la organización.'
        }
        action={
          <>
            <button type="button" onClick={() => window.print()} className="btn-secondary">
              <Printer size={16} /> Imprimir / PDF
            </button>
            <button type="button" onClick={exportCsv} disabled={isGenerating} className="btn-primary">
              <FileDown size={16} /> {isGenerating ? 'Generando…' : 'Exportar reporte'}
            </button>
          </>
        }
      />

      <SolutionBanner />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Servicios utilizados"
          value={`${summary.activeServices}/${summary.totalServices}`}
          icon={CloudCog}
          accent="brand"
          hint={solution ? 'Servicios de la solución sobre el catálogo' : 'Servicios activos sobre el catálogo'}
        />
        <StatCard
          label="Región seleccionada"
          value={summary.selectedRegionName}
          icon={MapPin}
          accent={summary.selectedRegionStatus === 'operational' ? 'brand' : 'cost'}
          hint={`${summary.selectedRegionCode} · ${HEALTH_LABELS[summary.selectedRegionStatus]} · ×${summary.pricingFactor.toFixed(2)}`}
        />
        <StatCard
          label="Costo mensual estimado"
          value={formatCurrency(summary.monthlyCost)}
          icon={DollarSign}
          accent="cost"
          hint={solution ? 'Según los recursos de Costos' : 'Servicios activos, 730 h/mes'}
        />
        <StatCard
          label="Costo anual estimado"
          value={formatCurrency(summary.annualCost)}
          icon={TrendingUp}
          accent="cost"
          hint="Costo mensual × 12"
        />
        <StatCard
          label="Estado de seguridad"
          value={`${summary.securityScore}%`}
          icon={ShieldCheck}
          accent={scoreTone === 'success' ? 'security' : scoreTone === 'warning' ? 'cost' : 'alert'}
          hint="Controles correctos"
        />
        <StatCard
          label="Recursos Cloud"
          value={String(summary.totalResources)}
          icon={Boxes}
          accent="brand"
          hint={solution ? 'Instancias y servicios de la solución' : 'Servicios desplegados en todas las regiones'}
        />
        <StatCard
          label="Estado de la arquitectura"
          value={ARCHITECTURE_LABELS[summary.architectureStatus]}
          icon={Activity}
          accent={summary.architectureStatus === 'operational' ? 'security' : 'cost'}
          hint={solution ? `Región de la solución · ${HEALTH_LABELS[summary.selectedRegionStatus]}` : 'Salud global de las regiones'}
        />
        <StatCard
          label="Propuestas registradas"
          value={String(proposals.length)}
          icon={ClipboardList}
          accent="brand"
          hint="Desde Planificación Cloud"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel
          title="Tendencia de costo mensual"
          icon={TrendingUp}
          iconClassName="text-cost"
          description="Evolución simulada del gasto mensual de la solución."
          className="xl:col-span-2"
        >
          <CostTrendChart data={summary.costTrend} />
        </Panel>

        <Panel
          title="Resumen de seguridad"
          icon={ShieldCheck}
          iconClassName="text-security"
          description="Responsabilidad compartida, IAM y cumplimiento."
        >
          <div className="flex items-end justify-between">
            <span className="text-sm text-text-secondary">Puntaje general</span>
            <span className="text-2xl font-bold text-text-primary">{summary.securityScore}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-background">
            <div
              className={`h-full rounded-full transition-all duration-700 ${scoreBar}`}
              style={{ width: `${summary.securityScore}%` }}
            />
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Problemas críticos</span>
              <StatusBadge label={String(criticalChecks.length)} tone={securityStatusTone('critical')} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Requieren revisión</span>
              <StatusBadge label={String(warningChecks.length)} tone={securityStatusTone('warning')} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Arquitectura</span>
              <StatusBadge
                label={ARCHITECTURE_LABELS[summary.architectureStatus]}
                tone={healthStatusTone(summary.architectureStatus)}
              />
            </div>
          </div>

          {criticalChecks[0] && (
            <p className="mt-5 rounded-lg border border-alert/30 bg-alert/5 p-3 text-xs text-alert">
              <span className="font-semibold">{criticalChecks[0].title}: </span>
              {criticalChecks[0].description}
            </p>
          )}

          <Link to="/security" className="mt-4 inline-block text-sm font-medium text-brand hover:underline print:hidden">
            Ver panel de seguridad →
          </Link>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel
          title="Costo mensual por categoría"
          icon={BarChart3}
          description="Haz clic en una barra para ver los servicios de esa categoría."
          className="xl:col-span-2"
        >
          <CostByCategoryChart
            data={summary.costByCategory}
            onSelectCategory={(category) => navigate(`/services?category=${category}`)}
          />
        </Panel>

        <Panel
          title="Servicios en uso"
          icon={CloudCog}
          description={solution ? `Componentes de "${solution.name}".` : 'Componentes activos de la solución.'}
        >
          <ul className="space-y-1">
            {usedServices.map((service) => (
              <li key={service.id}>
                <Link
                  to={`/services/${service.id}`}
                  className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-background"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <ServiceIcon name={service.icon} size={16} />
                  </span>
                  <span className="flex-1 text-sm font-medium text-text-primary">{shortServiceName(service.name)}</span>
                  <span className="hidden text-right text-xs text-text-secondary sm:block">{service.mainFunction}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  )
}
