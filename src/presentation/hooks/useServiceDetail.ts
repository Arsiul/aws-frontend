import { useCallback } from 'react'
import { useContainer } from '../../infrastructure/di/DIProvider'
import { useActiveSolution } from '../context/activeSolution'
import { useAsync } from './useAsync'

export function useServiceDetail(serviceId: string) {
  const { getCloudServiceDetail } = useContainer()
  const factory = useCallback(() => getCloudServiceDetail.execute(serviceId), [getCloudServiceDetail, serviceId])
  const { version } = useActiveSolution()
  return useAsync(factory, [factory, version])
}
