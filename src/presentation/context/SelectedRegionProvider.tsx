import { useMemo, type PropsWithChildren } from 'react'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import { SelectedRegionContext } from './selectedRegion'

const DEFAULT_REGION_ID = 'us-east-1'

export function SelectedRegionProvider({ children }: PropsWithChildren) {
  const [selectedRegionId, setSelectedRegionId] = useLocalStorageState('cloudops.selected-region', DEFAULT_REGION_ID)
  const value = useMemo(() => ({ selectedRegionId, setSelectedRegionId }), [selectedRegionId, setSelectedRegionId])

  return <SelectedRegionContext.Provider value={value}>{children}</SelectedRegionContext.Provider>
}
