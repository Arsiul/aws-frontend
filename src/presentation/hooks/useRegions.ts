import { useCallback } from 'react'
import { useContainer } from '../../infrastructure/di/DIProvider'
import { useActiveSolution } from '../context/activeSolution'
import { useAsync } from './useAsync'

export function useRegions() {
  const { getRegions } = useContainer()
  const factory = useCallback(() => getRegions.execute(), [getRegions])
  return useAsync(factory, [factory])
}

export function useRegionConnections() {
  const { getRegionConnections } = useContainer()
  const factory = useCallback(() => getRegionConnections.execute(), [getRegionConnections])
  const { version } = useActiveSolution()
  return useAsync(factory, [factory, version])
}
