import { useCallback, useState } from 'react'
import type { FailoverResult, Region } from '../../domain/entities'
import { useContainer } from '../../infrastructure/di/DIProvider'

interface FailoverState {
  result: FailoverResult | null
  isSimulating: boolean
  error: string | null
}

/** Imperative hook: the user picks a region to "cut off" and this runs the
 *  SimulateRegionFailoverUseCase against the current (possibly client-mutated) region list. */
export function useRegionFailover() {
  const { simulateRegionFailover } = useContainer()
  const [state, setState] = useState<FailoverState>({ result: null, isSimulating: false, error: null })

  const simulate = useCallback(
    async (regionId: string, regions: Region[]) => {
      setState({ result: null, isSimulating: true, error: null })
      try {
        const patchedRegions = regions.map((r) => (r.id === regionId ? { ...r, status: 'outage' as const } : r))
        const result = await simulateRegionFailover.execute(regionId, patchedRegions)
        setState({ result, isSimulating: false, error: null })
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No se pudo simular el failover'
        setState({ result: null, isSimulating: false, error: message })
        return null
      }
    },
    [simulateRegionFailover],
  )

  const reset = useCallback(() => setState({ result: null, isSimulating: false, error: null }), [])

  return { ...state, simulate, reset }
}
