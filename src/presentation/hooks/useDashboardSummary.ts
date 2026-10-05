import { useCallback } from 'react'
import { useContainer } from '../../infrastructure/di/DIProvider'
import { useAsync } from './useAsync'

export function useDashboardSummary(selectedRegionId: string) {
  const { getDashboardSummary } = useContainer()
  const factory = useCallback(
    () => getDashboardSummary.execute(selectedRegionId),
    [getDashboardSummary, selectedRegionId],
  )
  return useAsync(factory, [factory])
}
