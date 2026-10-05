import type { CostCatalogItem } from '../../domain/entities'
import type { ICostRepository } from '../../domain/repositories'
import { simulatedDelay } from '../../shared/utils/async'
import { COST_CATALOG_DATA } from '../data/costCatalog.data'

/** Only exposes the price list; the estimate itself is a business rule in EstimateCostUseCase. */
export class CostRepository implements ICostRepository {
  async getCatalog(): Promise<CostCatalogItem[]> {
    await simulatedDelay()
    return COST_CATALOG_DATA
  }
}
