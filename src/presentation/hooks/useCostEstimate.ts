import { useCallback, useEffect, useState } from 'react'
import type { CostLineItem } from '../../domain/entities'
import type { CostEstimateRequest } from '../../domain/repositories'
import { useContainer } from '../../infrastructure/di/DIProvider'
import { useAsync } from './useAsync'

export function useCostCatalog() {
  const { getCostCatalog } = useContainer()
  const factory = useCallback(() => getCostCatalog.execute(), [getCostCatalog])
  return useAsync(factory, [factory])
}

/** Re-estimates whenever the line items or the region (and so its prices) change. */
export function useCostEstimate(requests: CostEstimateRequest[], regionId: string) {
  const { estimateCost } = useContainer()
  const [items, setItems] = useState<CostLineItem[]>([])

  useEffect(() => {
    let cancelled = false
    estimateCost.execute(requests, regionId).then((result) => {
      if (!cancelled) setItems(result)
    })
    return () => {
      cancelled = true
    }
  }, [estimateCost, requests, regionId])

  return items
}
