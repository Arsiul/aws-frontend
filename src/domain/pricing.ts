// Domain layer: on-demand pricing rules shared by every cost calculation.

import type { CostCatalogItem, CostEstimateRequest, CostLineItem } from './entities'

export const HOURS_PER_MONTH = 730
export const MONTHS_PER_YEAR = 12

/**
 * A line costs unitPrice × quantity per hour, the month is that hourly cost × the hours of use
 * entered, and the year is twelve months. The unit price is adjusted by the region's factor.
 */
export function estimateCostLines(
  requests: CostEstimateRequest[],
  catalog: CostCatalogItem[],
  pricingFactor = 1,
): CostLineItem[] {
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

/** Starting cost lines for a new solution: one unit of each billable service, running 24/7. */
export function defaultCostItems(serviceIds: string[], catalog: CostCatalogItem[]): CostEstimateRequest[] {
  return serviceIds
    .filter((id) => catalog.some((item) => item.serviceId === id))
    .map((serviceId) => ({ serviceId, quantity: 1, estimatedHours: HOURS_PER_MONTH }))
}
