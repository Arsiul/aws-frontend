import type { CloudReport } from '../../domain/entities'
import type { IPlanningRepository, IRegionRepository } from '../../domain/repositories'
import type { EstimateCostUseCase } from './EstimateCostUseCase'
import type { GetCloudServicesUseCase } from './GetCloudServicesUseCase'
import type { GetDashboardSummaryUseCase } from './GetDashboardSummaryUseCase'
import type { GetSecurityChecksUseCase } from './GetSecurityChecksUseCase'
import { loadActiveProposal } from './PlanningUseCases'

/** Gathers everything the exported report needs in one snapshot, already adapted to the active
 *  solution. Serialization (CSV, print) is a presentation concern and lives outside this layer. */
export class GenerateCloudReportUseCase {
  private readonly getDashboardSummary: GetDashboardSummaryUseCase
  private readonly getCloudServices: GetCloudServicesUseCase
  private readonly getSecurityChecks: GetSecurityChecksUseCase
  private readonly estimateCost: EstimateCostUseCase
  private readonly regionRepository: IRegionRepository
  private readonly planningRepository: IPlanningRepository

  constructor(
    getDashboardSummary: GetDashboardSummaryUseCase,
    getCloudServices: GetCloudServicesUseCase,
    getSecurityChecks: GetSecurityChecksUseCase,
    estimateCost: EstimateCostUseCase,
    regionRepository: IRegionRepository,
    planningRepository: IPlanningRepository,
  ) {
    this.getDashboardSummary = getDashboardSummary
    this.getCloudServices = getCloudServices
    this.getSecurityChecks = getSecurityChecks
    this.estimateCost = estimateCost
    this.regionRepository = regionRepository
    this.planningRepository = planningRepository
  }

  async execute(selectedRegionId?: string): Promise<CloudReport> {
    const active = await loadActiveProposal(this.planningRepository)
    const [summary, services, regions, securityChecks, proposals, costLines] = await Promise.all([
      this.getDashboardSummary.execute(selectedRegionId),
      this.getCloudServices.execute(),
      this.regionRepository.getAll(),
      this.getSecurityChecks.execute(),
      this.planningRepository.getAll(),
      active ? this.estimateCost.execute(active.costItems, active.regionId) : Promise.resolve([]),
    ])

    return { generatedAt: new Date().toISOString(), summary, costLines, services, regions, securityChecks, proposals }
  }
}
