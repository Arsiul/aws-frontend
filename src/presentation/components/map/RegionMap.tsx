import { useRef, useState, type MouseEvent } from 'react'
import { ComposableMap, Geographies, Geography, Line, Marker } from 'react-simple-maps'
import type { FailoverResult, Region, RegionConnection } from '../../../domain/entities'
import { haversineDistanceKm } from '../../../shared/utils/geo'
import { formatNumber } from '../../../shared/utils/format'
import { useChartPalette } from '../../context/theme'
import { FlowParticles } from './FlowParticles'
import { connectionPathD, MAP_HEIGHT, MAP_SCALE, MAP_WIDTH } from './mapProjection'

const WORLD_TOPOJSON_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

/** Longer hops animate slower so every arrow reads at roughly the same perceived speed. */
function flowDuration(from: [number, number], to: [number, number]): number {
  const distanceKm = haversineDistanceKm(from, to)
  return Math.min(7, Math.max(2.5, distanceKm / 2200))
}

const STATUS_COLOR: Record<Region['status'], string> = {
  operational: '#16A34A',
  degraded: '#F59E0B',
  outage: '#DC2626',
}

interface TooltipState {
  region: Region
  x: number
  y: number
}

interface RegionMapProps {
  regions: Region[]
  connections: RegionConnection[]
  failoverResult: FailoverResult | null
  onSimulateOutage: (regionId: string) => void
  isSimulating: boolean
  selectedRegionId?: string
  serviceNames?: Record<string, string>
}

export function RegionMap({
  regions,
  connections,
  failoverResult,
  onSimulateOutage,
  isSimulating,
  selectedRegionId,
  serviceNames = {},
}: RegionMapProps) {
  const palette = useChartPalette()
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const regionById = (id: string) => regions.find((r) => r.id === id)

  const showTooltip = (region: Region, event: MouseEvent) => {
    const bounds = containerRef.current?.getBoundingClientRect()
    if (!bounds) return
    setTooltip({ region, x: event.clientX - bounds.left, y: event.clientY - bounds.top })
  }

  const downRegionId = failoverResult?.downRegion.id
  const optimalRegionId = failoverResult?.optimalRegion?.id

  return (
    <div className="rounded-card border border-border bg-card p-4 shadow-card sm:p-5">
      <div ref={containerRef} className="relative overflow-hidden rounded-xl bg-background">
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: MAP_SCALE }}
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          style={{ width: '100%', height: 'auto' }}
        >
          <Geographies geography={WORLD_TOPOJSON_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={palette.land}
                  stroke={palette.landStroke}
                  strokeWidth={0.6}
                  style={{ outline: 'none' }}
                />
              ))
            }
          </Geographies>

          {connections.map((conn) => {
            const from = regionById(conn.fromRegionId)
            const to = regionById(conn.toRegionId)
            if (!from || !to) return null

            const involvesDownRegion = downRegionId && (conn.fromRegionId === downRegionId || conn.toRegionId === downRegionId)
            const key = `${conn.fromRegionId}-${conn.toRegionId}`

            return (
              <g key={key}>
                <Line
                  from={from.coordinates}
                  to={to.coordinates}
                  stroke={involvesDownRegion ? '#DC2626' : '#2563EB'}
                  strokeWidth={conn.type === 'primary' ? 1.4 : 1}
                  strokeOpacity={involvesDownRegion ? 0.35 : conn.type === 'primary' ? 0.55 : 0.3}
                  strokeDasharray={conn.type === 'backup' ? '3 3' : undefined}
                  style={{ transition: 'stroke 0.3s ease, stroke-opacity 0.3s ease' }}
                />
                {!involvesDownRegion && (
                  <FlowParticles
                    pathD={connectionPathD(from.coordinates, to.coordinates)}
                    color={conn.type === 'primary' ? '#2563EB' : '#94A3B8'}
                    durationSeconds={flowDuration(from.coordinates, to.coordinates)}
                    count={conn.type === 'primary' ? 2 : 1}
                  />
                )}
              </g>
            )
          })}

          {failoverResult?.optimalRegion && (
            <g>
              <Line
                from={failoverResult.downRegion.coordinates}
                to={failoverResult.optimalRegion.coordinates}
                stroke="#16A34A"
                strokeWidth={2}
                strokeDasharray="4 2"
              />
              <FlowParticles
                pathD={connectionPathD(failoverResult.downRegion.coordinates, failoverResult.optimalRegion.coordinates)}
                color="#16A34A"
                durationSeconds={flowDuration(failoverResult.downRegion.coordinates, failoverResult.optimalRegion.coordinates)}
                count={3}
              />
            </g>
          )}

          {regions.map((region) => {
            const isDown = region.id === downRegionId
            const isOptimal = region.id === optimalRegionId
            const isSelected = region.id === selectedRegionId

            return (
              <Marker
                key={region.id}
                coordinates={region.coordinates}
                onMouseEnter={(event) => showTooltip(region, event)}
                onMouseLeave={() => setTooltip(null)}
                onClick={() => onSimulateOutage(region.id)}
                style={{ cursor: 'pointer' }}
              >
                {isSelected && !isDown && (
                  <circle r={11} fill="none" stroke="#2563EB" strokeWidth={1.5} strokeDasharray="2 2" />
                )}
                {(isOptimal || isDown) && (
                  <circle
                    r={9}
                    fill={isOptimal ? '#16A34A' : '#DC2626'}
                    fillOpacity={0.2}
                    className="animate-scaleIn"
                  />
                )}
                <circle
                  r={5}
                  fill={STATUS_COLOR[region.status]}
                  stroke={palette.markerStroke}
                  strokeWidth={1.5}
                  style={{ transition: 'fill 0.3s ease' }}
                />
              </Marker>
            )
          })}
        </ComposableMap>

        {tooltip && (
          <div
            className="pointer-events-none absolute z-10 w-52 -translate-x-1/2 -translate-y-full animate-scaleIn rounded-xl border border-border bg-card p-3 shadow-lg"
            style={{ left: tooltip.x, top: tooltip.y - 10 }}
          >
            <p className="text-xs font-bold uppercase tracking-wide text-brand">{tooltip.region.country}</p>
            <p className="text-sm font-semibold text-text-primary">{tooltip.region.city}</p>
            <p className="mt-1 text-[11px] text-text-secondary">
              {tooltip.region.code}
              {tooltip.region.id === selectedRegionId && ' · Región principal'}
            </p>
            <p className="mt-1 text-[11px] text-text-primary">
              {tooltip.region.servicesDeployed.map((id) => serviceNames[id] ?? id.toUpperCase()).join(' · ')}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-text-secondary">
        <LegendDot color="#16A34A" label="Operativa" />
        <LegendDot color="#F59E0B" label="Degradada" />
        <LegendDot color="#DC2626" label="Caída" />
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border border-dashed border-brand" /> Región principal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-brand/60" /> Conexión primaria
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 border-t border-dashed border-slate-400" /> Conexión backup
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rotate-90 border-y-[3px] border-l-[5px] border-y-transparent border-l-brand" />
          Tráfico en tiempo real
        </span>
        <span className="ml-auto text-[11px]">
          Clic en una región para simular su caída y calcular la región óptima de reemplazo.
        </span>
      </div>

      {isSimulating && (
        <p className="mt-3 animate-fadeIn text-xs font-medium text-brand">Calculando región óptima de reemplazo…</p>
      )}

      {failoverResult && !isSimulating && (
        <div className="mt-3 animate-fadeInUp rounded-lg border border-border bg-background p-3 text-xs">
          {failoverResult.optimalRegion ? (
            <p className="text-text-primary">
              <span className="font-semibold text-alert">{failoverResult.downRegion.name}</span> cayó. Tráfico
              redirigido a{' '}
              <span className="font-semibold text-security">{failoverResult.optimalRegion.name}</span> (a ~
              {formatNumber(failoverResult.distanceKm ?? 0)} km), la región operativa más cercana.
            </p>
          ) : (
            <p className="text-alert">
              No hay ninguna región operativa disponible para redirigir el tráfico de{' '}
              {failoverResult.downRegion.name}.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  )
}
