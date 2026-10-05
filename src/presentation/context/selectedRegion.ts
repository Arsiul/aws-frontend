import { createContext, useContext } from 'react'

export interface SelectedRegionContextValue {
  selectedRegionId: string
  setSelectedRegionId: (regionId: string) => void
}

export const SelectedRegionContext = createContext<SelectedRegionContextValue | null>(null)

/** The region the whole solution is planned for: drives the dashboard, cost prices and defaults. */
export function useSelectedRegion(): SelectedRegionContextValue {
  const ctx = useContext(SelectedRegionContext)
  if (!ctx) throw new Error('useSelectedRegion must be used within a <SelectedRegionProvider>')
  return ctx
}
