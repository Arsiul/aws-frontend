import type {
  CategoryCost,
  CostTrendPoint,
  DashboardSummary,
  HealthStatus,
  ServiceCategory,
} from '../../domain/entities'
import { HOURS_PER_MONTH, MONTHS_PER_YEAR } from '../../domain/pricing'
import type {
  ICloudServiceRepository,
  IRegionRepository,
  ISecurityRepository,
} from '../../domain/repositories'

// Deterministic mock trend so the chart stays stable across renders without a real cost history API.
const MOCK_MONTHLY_TREND_FACTORS = [0.62, 0.66, 0.7, 0.74, 0.77, 0.82, 0.86, 0.9, 0.95, 0.97, 0.99, 1]
const MOCK_MONTH_LABELS = ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep']

/** Aggregates services, regions and security checks into the dashboard's summary card data.
 *  This composition belongs in the application layer, not a fake "dashboard repository" —
 *  it reuses the same ports every other page already depends on. */
export class GetDashboardSummaryUseCase {
  private readonly serviceRepository: ICloudServiceRepository
  private readonly regionRepository: IRegionRepository
  private readonly securityRepository: ISecurityRepository

  constructor(
    serviceRepository: ICloudServiceRepository,
    regionRepository: IRegionRepository,
    securityRepository: ISecurityRepository,
  ) {
    this.serviceRepository = serviceRepository
    this.regionRepository = regionRepository
    this.securityRepository = securityRepository
  }

  async execute(selectedRegionId?: string): Promise<DashboardSummary> {
    const [services, regions, securityChecks] = await Promise.all([
      this.serviceRepository.getAll(),
      this.regionRepository.getAll(),
      this.securityRepository.getChecks(),
    ])

    const selectedRegion =
      regions.find((r) => r.id === selectedRegionId) ??
      regions.find((r) => r.status === 'operational') ??
      regions[0]
    const pricingFactor = selectedRegion?.pricingFactor ?? 1

    const activeServices = services.filter((s) => s.status === 'active')
    const monthlyCostOf = (hourlyCost: number) => hourlyCost * HOURS_PER_MONTH * pricingFactor
    const monthlyCost = activeServices.reduce((total, service) => total + monthlyCostOf(service.hourlyCost), 0)

    const categoryTotals = new Map<ServiceCategory, number>()
    for (const service of activeServices) {
      categoryTotals.set(service.category, (categoryTotals.get(service.category) ?? 0) + monthlyCostOf(service.hourlyCost))
    }
    const costByCategory: CategoryCost[] = [...categoryTotals.entries()]
      .map(([category, cost]) => ({ category, cost: Math.round(cost * 100) / 100 }))
      .sort((a, b) => b.cost - a.cost)

    const okChecks = securityChecks.filter((c) => c.status === 'ok').length
    const securityScore = securityChecks.length ? Math.round((okChecks / securityChecks.length) * 100) : 0

    const architectureStatus: HealthStatus = regions.some((r) => r.status === 'outage')
      ? 'outage'
      : regions.some((r) => r.status === 'degraded')
        ? 'degraded'
        : 'operational'

    const costTrend: CostTrendPoint[] = MOCK_MONTHLY_TREND_FACTORS.map((factor, index) => ({
      month: MOCK_MONTH_LABELS[index],
      cost: Math.round(monthlyCost * factor),
    }))

    return {
      totalServices: services.length,
      activeServices: activeServices.length,
      selectedRegionId: selectedRegion?.id ?? '',
      selectedRegionName: selectedRegion?.name ?? 'N/D',
      selectedRegionCode: selectedRegion?.code ?? '',
      selectedRegionStatus: selectedRegion?.status ?? 'operational',
      pricingFactor,
      monthlyCost,
      annualCost: monthlyCost * MONTHS_PER_YEAR,
      securityScore,
      totalResources: regions.reduce((total, region) => total + region.servicesDeployed.length, 0),
      architectureStatus,
      costTrend,
      costByCategory,
    }
  }
}
