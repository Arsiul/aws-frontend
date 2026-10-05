import { useCallback } from 'react'
import { useContainer } from '../../infrastructure/di/DIProvider'
import { useActiveSolution } from '../context/activeSolution'
import { useAsync } from './useAsync'

export function useCloudServices() {
  const { getCloudServices } = useContainer()
  const factory = useCallback(() => getCloudServices.execute(), [getCloudServices])
  const { version } = useActiveSolution()
  return useAsync(factory, [factory, version])
}
