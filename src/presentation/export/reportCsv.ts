import type { CloudReport, CostLineItem, Region } from '../../domain/entities'
import { toCsv, type CsvRow } from '../../shared/utils/csv'
import { formatDateTime } from '../../shared/utils/format'
import {
  ARCHITECTURE_LABELS,
  AVAILABILITY_LABELS,
  HEALTH_LABELS,
  SECURITY_CATEGORY_LABELS,
  SECURITY_STATUS_LABELS,
  SERVICE_CATEGORY_LABELS,
  UTILIZATION_LABELS,
} from '../labels'

const round = (value: number, decimals = 2) => Number(value.toFixed(decimals))

/** One CSV with a block per module, separated by blank rows, so it reads well in Excel. */
export function cloudReportToCsv(report: CloudReport): string {
  const { summary } = report
  const regionName = (id: string) => report.regions.find((r: Region) => r.id === id)?.name ?? id
  const serviceName = (id: string) => report.services.find((s) => s.id === id)?.name ?? id

  const rows: CsvRow[] = [
    ['CloudOps Dashboard — Reporte de la solución Cloud'],
    ['Generado', formatDateTime(report.generatedAt)],
    [],
    ...(summary.solution
      ? [
          ['SOLUCIÓN ACTIVA'],
          ['Nombre', summary.solution.name],
          ['Tipo de aplicación', summary.solution.applicationType],
          ['Usuarios estimados', summary.solution.estimatedUsers],
          ['Disponibilidad', AVAILABILITY_LABELS[summary.solution.availabilityLevel]],
          ['Objetivo de la migración', summary.solution.migrationGoal],
          ['Servicios', summary.usedServiceIds.map(serviceName).join(' | ')],
          [],
        ]
      : []),
    ['RESUMEN'],
    ['Indicador', 'Valor'],
    ['Región seleccionada', `${summary.selectedRegionName} (${summary.selectedRegionCode})`],
    ['Factor de precio de la región', summary.pricingFactor],
    ['Servicios utilizados', `${summary.activeServices}/${summary.totalServices}`],
    ['Costo mensual estimado (USD)', round(summary.monthlyCost)],
    ['Costo anual estimado (USD)', round(summary.annualCost)],
    ['Estado de seguridad (%)', summary.securityScore],
    ['Recursos Cloud', summary.totalResources],
    ['Estado de la arquitectura', ARCHITECTURE_LABELS[summary.architectureStatus]],
    ...(report.costLines.length
      ? [
          [],
          ['RECURSOS Y COSTOS DE LA SOLUCIÓN'],
          ['Servicio', 'Cantidad', 'Horas/mes', 'Costo/h (USD)', 'Costo mensual (USD)', 'Costo anual (USD)'],
          ...report.costLines.map((line) => [
            line.serviceName,
            line.quantity,
            line.estimatedHours,
            round(line.hourlyCost, 4),
            round(line.monthlyCost),
            round(line.annualCost),
          ]),
        ]
      : []),
    [],
    ['SERVICIOS AWS'],
    ['Servicio', 'Categoría', 'Función principal', 'Estado', 'Costo por hora (USD)'],
    ...report.services.map((s) => [
      s.name,
      SERVICE_CATEGORY_LABELS[s.category],
      s.mainFunction,
      UTILIZATION_LABELS[s.status],
      s.hourlyCost,
    ]),
    [],
    ['INFRAESTRUCTURA GLOBAL'],
    ['Región', 'Código', 'Ubicación', 'Estado', 'Zonas de disponibilidad', 'Servicios desplegados'],
    ...report.regions.map((r) => [
      r.name,
      r.code,
      `${r.city}, ${r.country}`,
      HEALTH_LABELS[r.status],
      r.availabilityZones.length,
      r.servicesDeployed.map(serviceName).join(' | '),
    ]),
    [],
    ['SEGURIDAD'],
    ['Control', 'Categoría', 'Estado', 'Detalle'],
    ...report.securityChecks.map((c) => [
      c.title,
      SECURITY_CATEGORY_LABELS[c.category],
      SECURITY_STATUS_LABELS[c.status],
      c.description,
    ]),
    [],
    ['PROPUESTAS REGISTRADAS'],
    ['Solución', 'Tipo', 'Región', 'Usuarios', 'Disponibilidad', 'Servicios', 'Objetivo', 'Descripción'],
    ...report.proposals.map((p) => [
      p.solutionName,
      p.applicationType,
      regionName(p.regionId),
      p.estimatedUsers,
      AVAILABILITY_LABELS[p.availabilityLevel],
      p.selectedServices.map(serviceName).join(' | '),
      p.migrationGoal,
      p.description,
    ]),
  ]

  if (report.proposals.length === 0) rows.push(['(Sin propuestas registradas)'])

  return toCsv(rows)
}

export function costEstimateToCsv(items: CostLineItem[], regionLabel: string): string {
  const totalMonthly = items.reduce((sum, item) => sum + item.monthlyCost, 0)
  const rows: CsvRow[] = [
    ['CloudOps Dashboard — Estimación de costos'],
    ['Región', regionLabel],
    [],
    ['Servicio', 'Cantidad', 'Horas/mes', 'Precio unitario/h (USD)', 'Costo/h (USD)', 'Costo mensual (USD)', 'Costo anual (USD)'],
    ...items.map((item) => [
      item.serviceName,
      item.quantity,
      item.estimatedHours,
      round(item.unitCost, 4),
      round(item.hourlyCost, 4),
      round(item.monthlyCost),
      round(item.annualCost),
    ]),
    [],
    ['TOTAL', '', '', '', '', round(totalMonthly), round(totalMonthly * 12)],
  ]
  return toCsv(rows)
}
