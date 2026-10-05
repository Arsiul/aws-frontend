import { useCallback } from 'react'
import { useContainer } from '../../infrastructure/di/DIProvider'
import { useActiveSolution } from '../context/activeSolution'
import { useAsync } from './useAsync'

export function useNetworkArchitecture() {
  const { getNetworkArchitecture } = useContainer()
  const factory = useCallback(() => getNetworkArchitecture.execute(), [getNetworkArchitecture])
  const { version } = useActiveSolution()
  return useAsync(factory, [factory, version])
}
