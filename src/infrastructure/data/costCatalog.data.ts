import type { CostCatalogItem } from '../../domain/entities'
import { SERVICES_DATA } from './services.data'

export const COST_CATALOG_DATA: CostCatalogItem[] = SERVICES_DATA.filter(
  (service) => service.hourlyCost > 0,
).map((service) => ({
  serviceId: service.id,
  serviceName: service.name,
  hourlyCost: service.hourlyCost,
}))
