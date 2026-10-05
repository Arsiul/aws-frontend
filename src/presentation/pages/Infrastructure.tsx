import { Globe, Layers, MapPinned, ServerCog, TriangleAlert } from 'lucide-react'
import { formatNumber } from '../../shared/utils/format'
import { ErrorState, LoadingState } from '../components/common/AsyncState'
import { PageHeader } from '../components/common/PageHeader'
import { SolutionBanner } from '../components/common/SolutionBanner'
import { RegionCard } from '../components/common/RegionCard'
import { StatCard } from '../components/common/StatCard'
import { RegionMap } from '../components/map/RegionMap'
import { useActiveSolution } from '../context/activeSolution'
import { useNotifications } from '../context/notifications'
import { useSelectedRegion } from '../context/selectedRegion'
import { useCloudServices } from '../hooks/useCloudServices'
import { useRegionFailover } from '../hooks/useRegionFailover'
import { useRegionConnections, useRegions } from '../hooks/useRegions'
import { shortServiceName } from '../labels'

export function Infrastructure() {
  const { data: regions, isLoading, error } = useRegions()
  const { data: connections } = useRegionConnections()
  const { data: services } = useCloudServices()
  const { result, isSimulating, simulate, reset } = useRegionFailover()
  const { selectedRegionId } = useSelectedRegion()
  const { activeProposal, changeRegion } = useActiveSolution()
  const { notify } = useNotifications()

  if (isLoading) return <LoadingState label="Cargando infraestructura global…" />
  if (error) return <ErrorState message={error} />
  if (!regions) return null

  const serviceNames = Object.fromEntries((services ?? []).map((s) => [s.id, shortServiceName(s.name)]))
  const totalZones = regions.reduce((sum, r) => sum + r.availabilityZones.length, 0)
  const operational = regions.filter((r) => r.status === 'operational').length

  const handleSimulate = async (regionId: string) => {
    if (regions.find((r) => r.id === regionId)?.status === 'outage') return
    const failover = await simulate(regionId, regions)
    if (!failover) return
    notify({
      tone: failover.optimalRegion ? 'warning' : 'critical',
      title: `Simulación: caída de ${failover.downRegion.name}`,
      message: failover.optimalRegion
        ? `Tráfico redirigido a ${failover.optimalRegion.name} (~${formatNumber(failover.distanceKm ?? 0)} km).`
        : 'No hay ninguna región operativa disponible para el failover.',
    })
  }

  const handleSelect = (regionId: string) => {
    changeRegion(regionId)
    const region = regions.find((r) => r.id === regionId)
    if (region) {
      notify({
        tone: 'info',
        title: activeProposal ? `${activeProposal.solutionName} → ${region.name}` : `Región principal: ${region.name}`,
        message: activeProposal ? 'La solución se movió de región: costos y Dashboard se recalculan.' : region.code,
      })
    }
  }

  const solutionOn = (regionId: string) =>
    activeProposal?.regionId === regionId
      ? { name: activeProposal.solutionName, services: activeProposal.selectedServices.map((id) => serviceNames[id] ?? id) }
      : undefined

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Globe}
        title="Infraestructura global de AWS"
        description="Regiones, zonas de disponibilidad, servicios desplegados y conexiones entre regiones."
        action={
          result && (
            <button type="button" onClick={reset} className="btn-secondary">
              Limpiar simulación
            </button>
          )
        }
      />

      <SolutionBanner detail="su región se resalta en el mapa y en su tarjeta" />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Regiones" value={String(regions.length)} icon={MapPinned} accent="brand" />
        <StatCard label="Zonas de disponibilidad" value={String(totalZones)} icon={Layers} accent="brand" />
        <StatCard
          label="Regiones operativas"
          value={`${operational}/${regions.length}`}
          icon={ServerCog}
          accent="security"
        />
        <StatCard
          label="Con incidencias"
          value={String(regions.length - operational)}
          icon={TriangleAlert}
          accent={regions.length - operational > 0 ? 'cost' : 'security'}
        />
      </div>

      <RegionMap
        regions={regions}
        connections={connections ?? []}
        failoverResult={result}
        onSimulateOutage={handleSimulate}
        isSimulating={isSimulating}
        selectedRegionId={selectedRegionId}
        serviceNames={serviceNames}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {regions.map((region) => (
          <RegionCard
            key={region.id}
            region={region}
            serviceNames={serviceNames}
            isSelected={region.id === selectedRegionId}
            solution={solutionOn(region.id)}
            onSelect={handleSelect}
            onSimulateOutage={handleSimulate}
            isSimulating={isSimulating}
          />
        ))}
      </div>
    </div>
  )
}
