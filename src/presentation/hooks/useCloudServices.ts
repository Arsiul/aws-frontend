import { useCallback } from 'react'
import { useContainer } from '../../infrastructure/di/DIProvider'
import { useAsync } from './useAsync'

export function useCloudServices() {
  const { getCloudServices } = useContainer()
  const factory = useCallback(() => getCloudServices.execute(), [getCloudServices])
  return useAsync(factory, [factory])
}
