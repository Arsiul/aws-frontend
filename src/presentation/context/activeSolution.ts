import { createContext, useContext } from 'react'
import type { CloudProposal, NewCloudProposal } from '../../domain/entities'

export interface ActiveSolutionContextValue {
  proposals: CloudProposal[]
  activeProposal: CloudProposal | null
  isLoading: boolean
  error: string | null
  /** Bumps on every change so data hooks know to refetch what derives from the solution. */
  version: number
  isSubmitting: boolean
  submitError: string | null
  register: (proposal: NewCloudProposal) => Promise<boolean>
  remove: (id: string) => Promise<void>
  activate: (id: string | null) => Promise<void>
  updateActive: (changes: Partial<Omit<CloudProposal, 'id' | 'createdAt'>>) => Promise<boolean>
  /** Changes the working region; with an active solution it also moves the solution there. */
  changeRegion: (regionId: string) => Promise<void>
  loadExample: () => Promise<void>
  resetAll: () => Promise<void>
}

export const ActiveSolutionContext = createContext<ActiveSolutionContextValue | null>(null)

/** The user's own solution that every module reads: dashboard, costs, network, security… */
export function useActiveSolution(): ActiveSolutionContextValue {
  const ctx = useContext(ActiveSolutionContext)
  if (!ctx) throw new Error('useActiveSolution must be used within an <ActiveSolutionProvider>')
  return ctx
}
