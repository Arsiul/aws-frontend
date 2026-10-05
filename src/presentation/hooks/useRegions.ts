import { useCallback } from 'react'
import { useContainer } from '../../infrastructure/di/DIProvider'
import { useAsync } from './useAsync'

export function useRegions() {
  const { getRegions } = useContainer()
  const factory = useCallback(() => getRegions.execute(), [getRegions])
  return useAsync(factory, [factory])
}

export function useRegionConnections() {
  const { getRegionConnections } = useContainer()
  const factory = useCallback(() => getRegionConnections.execute(), [getRegionConnections])
  return useAsync(factory, [factory])
}
