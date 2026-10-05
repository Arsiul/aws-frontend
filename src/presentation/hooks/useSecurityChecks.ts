import { useCallback } from 'react'
import { useContainer } from '../../infrastructure/di/DIProvider'
import { useActiveSolution } from '../context/activeSolution'
import { useAsync } from './useAsync'

export function useSecurityChecks() {
  const { getSecurityChecks } = useContainer()
  const factory = useCallback(() => getSecurityChecks.execute(), [getSecurityChecks])
  const { version } = useActiveSolution()
  return useAsync(factory, [factory, version])
}

export function useIamIdentities() {
  const { getIamIdentities } = useContainer()
  const factory = useCallback(() => getIamIdentities.execute(), [getIamIdentities])
  return useAsync(factory, [factory])
}

export function useSharedResponsibility() {
  const { getSharedResponsibility } = useContainer()
  const factory = useCallback(() => getSharedResponsibility.execute(), [getSharedResponsibility])
  return useAsync(factory, [factory])
}
