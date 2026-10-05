import type { CostCatalogItem, CostLineItem } from '../../domain/entities'
import { MONTHS_PER_YEAR } from '../../domain/pricing'
import type { CostEstimateRequest, ICostRepository, IRegionRepository } from '../../domain/repositories'

export class GetCostCatalogUseCase {
  private readonly costRepository: ICostRepository

  constructor(costRepository: ICostRepository) {
    this.costRepository = costRepository
  }

  execute(): Promise<CostCatalogItem[]> {
    return this.costRepository.getCatalog()
  }
}

/**
 * Business rule (on-demand pricing): a line costs unitPrice × quantity per hour, the month
 * is that hourly cost × the hours of use entered, and the year is twelve months.
 * The unit price is adjusted by the selected region's pricing factor.
 */
export class EstimateCostUseCase {
  private readonly costRepository: ICostRepository
  private readonly regionRepository: IRegionRepository

  constructor(costRepository: ICostRepository, regionRepository: IRegionRepository) {
    this.costRepository = costRepository
    this.regionRepository = regionRepository
  }

  async execute(requests: CostEstimateRequest[], regionId?: string): Promise<CostLineItem[]> {
    if (requests.length === 0) return []

    const [catalog, region] = await Promise.all([
      this.costRepository.getCatalog(),
      regionId ? this.regionRepository.getById(regionId) : Promise.resolve(undefined),
    ])
    const pricingFactor = region?.pricingFactor ?? 1

    return requests.map((request, index) => {
      const catalogItem = catalog.find((item) => item.serviceId === request.serviceId)
      const unitCost = (catalogItem?.hourlyCost ?? 0) * pricingFactor
      const hourlyCost = unitCost * request.quantity
      const monthlyCost = hourlyCost * request.estimatedHours

      return {
        id: `${request.serviceId}-${index}`,
        serviceId: request.serviceId,
        serviceName: catalogItem?.serviceName ?? request.serviceId,
        quantity: request.quantity,
        estimatedHours: request.estimatedHours,
        unitCost,
        hourlyCost,
        monthlyCost,
        annualCost: monthlyCost * MONTHS_PER_YEAR,
      }
    })
  }
}
