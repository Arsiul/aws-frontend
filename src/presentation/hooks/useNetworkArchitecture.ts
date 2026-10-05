import { useCallback } from 'react'
import { useContainer } from '../../infrastructure/di/DIProvider'
import { useAsync } from './useAsync'

export function useNetworkArchitecture() {
  const { getNetworkArchitecture } = useContainer()
  const factory = useCallback(() => getNetworkArchitecture.execute(), [getNetworkArchitecture])
  return useAsync(factory, [factory])
}
