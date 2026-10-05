import type {
  CategoryCost,
  CloudService,
  CostTrendPoint,
  DashboardSummary,
  HealthStatus,
  ServiceCategory,
} from '../../domain/entities'
import { estimateCostLines, HOURS_PER_MONTH, MONTHS_PER_YEAR } from '../../domain/pricing'
import type {
  ICloudServiceRepository,
  ICostRepository,
  IPlanningRepository,
  IRegionRepository,
} from '../../domain/repositories'
import type { GetSecurityChecksUseCase } from './GetSecurityChecksUseCase'
import { loadActiveProposal } from './PlanningUseCases'

// Deterministic mock trend so the chart stays stable across renders without a real cost history API.
const MOCK_MONTHLY_TREND_FACTORS = [0.62, 0.66, 0.7, 0.74, 0.77, 0.82, 0.86, 0.9, 0.95, 0.97, 0.99, 1]
const MOCK_MONTH_LABELS = ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep']

function costByCategory(costs: { serviceId: string; monthlyCost: number }[], services: CloudService[]): CategoryCost[] {
  const totals = new Map<ServiceCategory, number>()
  for (const { serviceId, monthlyCost } of costs) {
    const category = services.find((s) => s.id === serviceId)?.category
    if (category) totals.set(category, (totals.get(category) ?? 0) + monthlyCost)
  }
  return [...totals.entries()]
    .map(([category, cost]) => ({ category, cost: Math.round(cost * 100) / 100 }))
    .sort((a, b) => b.cost - a.cost)
}

/** Aggregates the dashboard cards. With an active solution everything comes from it (its region,
 *  services, cost lines and evaluated security); otherwise it summarizes the reference catalog. */
export class GetDashboardSummaryUseCase {
  private readonly serviceRepository: ICloudServiceRepository
  private readonly regionRepository: IRegionRepository
  private readonly costRepository: ICostRepository
  private readonly planningRepository: IPlanningRepository
  private readonly getSecurityChecks: GetSecurityChecksUseCase

  constructor(
    serviceRepository: ICloudServiceRepository,
    regionRepository: IRegionRepository,
    costRepository: ICostRepository,
    planningRepository: IPlanningRepository,
    getSecurityChecks: GetSecurityChecksUseCase,
  ) {
    this.serviceRepository = serviceRepository
    this.regionRepository = regionRepository
    this.costRepository = costRepository
    this.planningRepository = planningRepository
    this.getSecurityChecks = getSecurityChecks
  }

  async execute(selectedRegionId?: string): Promise<DashboardSummary> {
    const [services, regions, securityChecks, catalog, proposal] = await Promise.all([
      this.serviceRepository.getAll(),
      this.regionRepository.getAll(),
      this.getSecurityChecks.execute(),
      this.costRepository.getCatalog(),
      loadActiveProposal(this.planningRepository),
    ])

    const regionId = proposal?.regionId ?? selectedRegionId
    const selectedRegion =
      regions.find((r) => r.id === regionId) ?? regions.find((r) => r.status === 'operational') ?? regions[0]
    const pricingFactor = selectedRegion?.pricingFactor ?? 1

    let usedServiceIds: string[]
    let monthlyByService: { serviceId: string; monthlyCost: number }[]
    let totalResources: number
    let architectureStatus: HealthStatus

    if (proposal) {
      usedServiceIds = proposal.selectedServices
      monthlyByService = estimateCostLines(proposal.costItems, catalog, pricingFactor)
      const billed = new Set(proposal.costItems.map((item) => item.serviceId))
      totalResources =
        proposal.costItems.reduce((sum, item) => sum + item.quantity, 0) +
        proposal.selectedServices.filter((id) => !billed.has(id)).length
      architectureStatus = selectedRegion?.status ?? 'operational'
    } else {
      const activeServices = services.filter((s) => s.status === 'active')
      usedServiceIds = activeServices.map((s) => s.id)
      monthlyByService = activeServices.map((s) => ({
        serviceId: s.id,
        monthlyCost: s.hourlyCost * HOURS_PER_MONTH * pricingFactor,
      }))
      totalResources = regions.reduce((total, region) => total + region.servicesDeployed.length, 0)
      architectureStatus = regions.some((r) => r.status === 'outage')
        ? 'outage'
        : regions.some((r) => r.status === 'degraded')
          ? 'degraded'
          : 'operational'
    }

    const monthlyCost = monthlyByService.reduce((total, line) => total + line.monthlyCost, 0)
    const okChecks = securityChecks.filter((c) => c.status === 'ok').length
    const securityScore = securityChecks.length ? Math.round((okChecks / securityChecks.length) * 100) : 0

    const costTrend: CostTrendPoint[] = MOCK_MONTHLY_TREND_FACTORS.map((factor, index) => ({
      month: MOCK_MONTH_LABELS[index],
      cost: Math.round(monthlyCost * factor),
    }))

    return {
      solution: proposal
        ? {
            id: proposal.id,
            name: proposal.solutionName,
            applicationType: proposal.applicationType,
            availabilityLevel: proposal.availabilityLevel,
            estimatedUsers: proposal.estimatedUsers,
            migrationGoal: proposal.migrationGoal,
          }
        : null,
      usedServiceIds,
      totalServices: services.length,
      activeServices: usedServiceIds.length,
      selectedRegionId: selectedRegion?.id ?? '',
      selectedRegionName: selectedRegion?.name ?? 'N/D',
      selectedRegionCode: selectedRegion?.code ?? '',
      selectedRegionStatus: selectedRegion?.status ?? 'operational',
      pricingFactor,
      monthlyCost,
      annualCost: monthlyCost * MONTHS_PER_YEAR,
      securityScore,
      totalResources,
      architectureStatus,
      costTrend,
      costByCategory: costByCategory(monthlyByService, services),
    }
  }
}
