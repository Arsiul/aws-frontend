import { useCallback } from 'react'
import { useContainer } from '../../infrastructure/di/DIProvider'
import { useActiveSolution } from '../context/activeSolution'
import { useAsync } from './useAsync'

export function useDashboardSummary(selectedRegionId: string) {
  const { getDashboardSummary } = useContainer()
  const factory = useCallback(
    () => getDashboardSummary.execute(selectedRegionId),
    [getDashboardSummary, selectedRegionId],
  )
  const { version } = useActiveSolution()
  return useAsync(factory, [factory, version])
}
