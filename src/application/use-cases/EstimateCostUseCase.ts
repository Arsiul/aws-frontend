import type { CostCatalogItem, CostLineItem } from '../../domain/entities'
import { estimateCostLines } from '../../domain/pricing'
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

/** Prices the requested lines with the selected region's pricing factor (see domain/pricing). */
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
    return estimateCostLines(requests, catalog, region?.pricingFactor ?? 1)
  }
}
