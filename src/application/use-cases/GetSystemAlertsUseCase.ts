import type { SystemAlert } from '../../domain/entities'
import type { IRegionRepository, ISecurityRepository } from '../../domain/repositories'

const REGION_STATUS_LABEL = { degraded: 'degradada', outage: 'caída' } as const

/** Derives the notification-center alerts from the current state: security checks that are
 *  not "ok" and regions that are not operational. Stable ids let the UI remember what was read. */
export class GetSystemAlertsUseCase {
  private readonly securityRepository: ISecurityRepository
  private readonly regionRepository: IRegionRepository

  constructor(securityRepository: ISecurityRepository, regionRepository: IRegionRepository) {
    this.securityRepository = securityRepository
    this.regionRepository = regionRepository
  }

  async execute(): Promise<SystemAlert[]> {
    const [checks, regions] = await Promise.all([
      this.securityRepository.getChecks(),
      this.regionRepository.getAll(),
    ])

    const securityAlerts: SystemAlert[] = checks
      .filter((check) => check.status !== 'ok')
      .map((check) => ({
        id: `security-${check.id}`,
        title: check.title,
        message: check.description,
        severity: check.status === 'critical' ? 'critical' : 'warning',
        source: 'security',
      }))

    const regionAlerts: SystemAlert[] = regions
      .filter((region) => region.status !== 'operational')
      .map((region) => ({
        id: `region-${region.id}-${region.status}`,
        title: `Región ${region.name} ${REGION_STATUS_LABEL[region.status as 'degraded' | 'outage']}`,
        message: `${region.code}: ${region.availabilityZones.filter((az) => az.status !== 'operational').length} zona(s) de disponibilidad con incidencias.`,
        severity: region.status === 'outage' ? 'critical' : 'warning',
        source: 'infrastructure',
      }))

    return [...securityAlerts, ...regionAlerts].sort((a, b) =>
      a.severity === b.severity ? 0 : a.severity === 'critical' ? -1 : 1,
    )
  }
}
