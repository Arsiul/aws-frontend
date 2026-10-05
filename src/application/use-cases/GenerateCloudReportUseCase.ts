import type { CloudReport } from '../../domain/entities'
import type {
  ICloudServiceRepository,
  IPlanningRepository,
  IRegionRepository,
  ISecurityRepository,
} from '../../domain/repositories'
import type { GetDashboardSummaryUseCase } from './GetDashboardSummaryUseCase'

/** Gathers everything the exported report needs in one snapshot. Serialization (CSV, print)
 *  is a presentation concern and lives outside this layer. */
export class GenerateCloudReportUseCase {
  private readonly getDashboardSummary: GetDashboardSummaryUseCase
  private readonly serviceRepository: ICloudServiceRepository
  private readonly regionRepository: IRegionRepository
  private readonly securityRepository: ISecurityRepository
  private readonly planningRepository: IPlanningRepository

  constructor(
    getDashboardSummary: GetDashboardSummaryUseCase,
    serviceRepository: ICloudServiceRepository,
    regionRepository: IRegionRepository,
    securityRepository: ISecurityRepository,
    planningRepository: IPlanningRepository,
  ) {
    this.getDashboardSummary = getDashboardSummary
    this.serviceRepository = serviceRepository
    this.regionRepository = regionRepository
    this.securityRepository = securityRepository
    this.planningRepository = planningRepository
  }

  async execute(selectedRegionId?: string): Promise<CloudReport> {
    const [summary, services, regions, securityChecks, proposals] = await Promise.all([
      this.getDashboardSummary.execute(selectedRegionId),
      this.serviceRepository.getAll(),
      this.regionRepository.getAll(),
      this.securityRepository.getChecks(),
      this.planningRepository.getAll(),
    ])

    return { generatedAt: new Date().toISOString(), summary, services, regions, securityChecks, proposals }
  }
}
