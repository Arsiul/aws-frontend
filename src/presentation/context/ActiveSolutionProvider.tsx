import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import type { CloudProposal, NewCloudProposal } from '../../domain/entities'
import { useContainer } from '../../infrastructure/di/DIProvider'
import { ActiveSolutionContext } from './activeSolution'
import { useNotifications } from './notifications'
import { useSelectedRegion } from './selectedRegion'

const STORAGE_PREFIX = 'cloudops.'

const errorMessage = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback)

export function ActiveSolutionProvider({ children }: PropsWithChildren) {
  const {
    getCloudProposals,
    getActiveProposal,
    registerCloudProposal,
    updateCloudProposal,
    deleteCloudProposal,
    setActiveProposal,
    loadExampleScenario,
    resetWorkspace,
  } = useContainer()
  const { setSelectedRegionId } = useSelectedRegion()
  const { notify } = useNotifications()

  const [proposals, setProposals] = useState<CloudProposal[]>([])
  const [activeProposal, setActive] = useState<CloudProposal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    try {
      const [all, active] = await Promise.all([getCloudProposals.execute(), getActiveProposal.execute()])
      setProposals(all)
      setActive(active)
      setError(null)
      return active
    } catch (err) {
      setError(errorMessage(err, 'No se pudieron cargar las propuestas'))
      return null
    } finally {
      setIsLoading(false)
      setVersion((v) => v + 1)
    }
  }, [getCloudProposals, getActiveProposal])

  // On start, the working region follows the solution that was active last time.
  useEffect(() => {
    reload().then((active) => {
      if (active) setSelectedRegionId(active.regionId)
    })
  }, [reload, setSelectedRegionId])

  const register = useCallback(
    async (proposal: NewCloudProposal) => {
      setIsSubmitting(true)
      setSubmitError(null)
      try {
        const created = await registerCloudProposal.execute(proposal)
        await reload()
        setSelectedRegionId(created.regionId)
        notify({
          tone: 'success',
          title: 'Propuesta registrada y activada',
          message: `"${created.solutionName}" ya alimenta el Dashboard, Costos, Red y Seguridad.`,
        })
        return true
      } catch (err) {
        setSubmitError(errorMessage(err, 'No se pudo registrar la propuesta'))
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [registerCloudProposal, reload, setSelectedRegionId, notify],
  )

  const remove = useCallback(
    async (id: string) => {
      const name = proposals.find((p) => p.id === id)?.solutionName
      await deleteCloudProposal.execute(id)
      await reload()
      notify({ tone: 'info', title: 'Propuesta eliminada', message: name })
    },
    [proposals, deleteCloudProposal, reload, notify],
  )

  const activate = useCallback(
    async (id: string | null) => {
      const active = await setActiveProposal.execute(id)
      await reload()
      if (active) {
        setSelectedRegionId(active.regionId)
        notify({ tone: 'info', title: `Solución activa: ${active.solutionName}`, message: 'Todos los módulos muestran ahora esta solución.' })
      } else {
        notify({ tone: 'info', title: 'Sin solución activa', message: 'Los módulos vuelven a mostrar la arquitectura de referencia.' })
      }
    },
    [setActiveProposal, reload, setSelectedRegionId, notify],
  )

  const updateActive = useCallback(
    async (changes: Partial<Omit<CloudProposal, 'id' | 'createdAt'>>) => {
      if (!activeProposal) return false
      try {
        await updateCloudProposal.execute({ ...activeProposal, ...changes })
        await reload()
        return true
      } catch (err) {
        notify({ tone: 'critical', title: 'No se pudo actualizar la solución', message: errorMessage(err, '') })
        return false
      }
    },
    [activeProposal, updateCloudProposal, reload, notify],
  )

  const changeRegion = useCallback(
    async (regionId: string) => {
      setSelectedRegionId(regionId)
      if (activeProposal && activeProposal.regionId !== regionId) await updateActive({ regionId })
    },
    [activeProposal, setSelectedRegionId, updateActive],
  )

  const loadExample = useCallback(async () => {
    const active = await loadExampleScenario.execute()
    await reload()
    if (active) setSelectedRegionId(active.regionId)
    notify({
      tone: 'success',
      title: 'Caso de ejemplo cargado',
      message: `3 soluciones de demostración. Activa: "${active?.solutionName ?? '—'}".`,
    })
  }, [loadExampleScenario, reload, setSelectedRegionId, notify])

  // Wipes every key this app owns (proposals, costs, region, theme, notifications) and reloads,
  // so all in-memory state starts from zero too.
  const resetAll = useCallback(async () => {
    await resetWorkspace.execute()
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith(STORAGE_PREFIX))
        .forEach((key) => localStorage.removeItem(key))
    } catch {
      // Storage unavailable: the reload still clears in-memory state.
    }
    window.location.assign('/dashboard')
  }, [resetWorkspace])

  const value = useMemo(
    () => ({
      proposals,
      activeProposal,
      isLoading,
      error,
      version,
      isSubmitting,
      submitError,
      register,
      remove,
      activate,
      updateActive,
      changeRegion,
      loadExample,
      resetAll,
    }),
    [proposals, activeProposal, isLoading, error, version, isSubmitting, submitError, register, remove, activate, updateActive, changeRegion, loadExample, resetAll],
  )

  return <ActiveSolutionContext.Provider value={value}>{children}</ActiveSolutionContext.Provider>
}
