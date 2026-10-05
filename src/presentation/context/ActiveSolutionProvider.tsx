import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import type { CloudProposal, NewCloudProposal, WorkspaceMode } from '../../domain/entities'
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
    editCloudProposal,
    deleteCloudProposal,
    setActiveProposal,
    loadExampleScenario,
    resetWorkspace,
    startBlankWorkspace,
    getWorkspaceMode,
  } = useContainer()
  const { setSelectedRegionId } = useSelectedRegion()
  const { notify } = useNotifications()

  const [proposals, setProposals] = useState<CloudProposal[]>([])
  const [activeProposal, setActive] = useState<CloudProposal | null>(null)
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('demo')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    try {
      const [all, active, mode] = await Promise.all([
        getCloudProposals.execute(),
        getActiveProposal.execute(),
        getWorkspaceMode.execute(),
      ])
      setProposals(all)
      setActive(active)
      setWorkspaceMode(mode)
      setError(null)
      return active
    } catch (err) {
      setError(errorMessage(err, 'No se pudieron cargar las propuestas'))
      return null
    } finally {
      setIsLoading(false)
      setVersion((v) => v + 1)
    }
  }, [getCloudProposals, getActiveProposal, getWorkspaceMode])

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

  const edit = useCallback(
    async (id: string, changes: NewCloudProposal) => {
      setIsSubmitting(true)
      setSubmitError(null)
      try {
        const saved = await editCloudProposal.execute(id, changes)
        const active = await reload()
        // Editing the active solution's region moves the whole app there, like the header selector.
        if (active?.id === saved.id) setSelectedRegionId(saved.regionId)
        notify({
          tone: 'success',
          title: 'Propuesta actualizada',
          message:
            active?.id === saved.id
              ? `"${saved.solutionName}" es la solución activa: todos los módulos ya reflejan los cambios.`
              : `"${saved.solutionName}" guardada.`,
        })
        return true
      } catch (err) {
        setSubmitError(errorMessage(err, 'No se pudo actualizar la propuesta'))
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [editCloudProposal, reload, setSelectedRegionId, notify],
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

  // Both resets wipe every key this app owns (proposals, costs, region, theme, notifications) and
  // reload, so all in-memory state starts from zero too. The use case runs last so the workspace
  // mode it writes survives the wipe.
  const wipeAndReload = useCallback(async (finish: () => Promise<void>) => {
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith(STORAGE_PREFIX))
        .forEach((key) => localStorage.removeItem(key))
    } catch {
      // Storage unavailable: the reload still clears in-memory state.
    }
    await finish()
    window.location.assign('/dashboard')
  }, [])

  const resetAll = useCallback(() => wipeAndReload(() => resetWorkspace.execute()), [wipeAndReload, resetWorkspace])
  const startBlank = useCallback(
    () => wipeAndReload(() => startBlankWorkspace.execute()),
    [wipeAndReload, startBlankWorkspace],
  )

  const value = useMemo(
    () => ({
      proposals,
      activeProposal,
      workspaceMode,
      isLoading,
      error,
      version,
      isSubmitting,
      submitError,
      register,
      edit,
      remove,
      activate,
      updateActive,
      changeRegion,
      loadExample,
      resetAll,
      startBlank,
    }),
    [proposals, activeProposal, workspaceMode, isLoading, error, version, isSubmitting, submitError, register, edit, remove, activate, updateActive, changeRegion, loadExample, resetAll, startBlank],
  )

  return <ActiveSolutionContext.Provider value={value}>{children}</ActiveSolutionContext.Provider>
}
