import { useCallback, useState } from 'react'
import type { CloudProposal } from '../../domain/entities'
import { useContainer } from '../../infrastructure/di/DIProvider'
import { useAsync } from './useAsync'

export function useCloudProposals() {
  const { getCloudProposals, registerCloudProposal, deleteCloudProposal } = useContainer()
  const [refreshKey, setRefreshKey] = useState(0)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const factory = useCallback(() => getCloudProposals.execute(), [getCloudProposals])
  const { data, isLoading, error } = useAsync(factory, [factory, refreshKey])

  const register = useCallback(
    async (proposal: Omit<CloudProposal, 'id' | 'createdAt'>) => {
      setIsSubmitting(true)
      setSubmitError(null)
      try {
        await registerCloudProposal.execute(proposal)
        setRefreshKey((key) => key + 1)
        return true
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'No se pudo registrar la propuesta')
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [registerCloudProposal],
  )

  const remove = useCallback(
    async (id: string) => {
      await deleteCloudProposal.execute(id)
      setRefreshKey((key) => key + 1)
    },
    [deleteCloudProposal],
  )

  return { proposals: data ?? [], isLoading, error, register, remove, isSubmitting, submitError }
}
