import { useCallback } from 'react'
import { useContainer } from '../../infrastructure/di/DIProvider'
import { useAsync } from './useAsync'

export function useServiceDetail(serviceId: string) {
  const { getCloudServiceDetail } = useContainer()
  const factory = useCallback(() => getCloudServiceDetail.execute(serviceId), [getCloudServiceDetail, serviceId])
  return useAsync(factory, [factory])
}
