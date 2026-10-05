import { MapPin } from 'lucide-react'
import { useActiveSolution } from '../../context/activeSolution'
import { useNotifications } from '../../context/notifications'
import { useSelectedRegion } from '../../context/selectedRegion'
import { useRegions } from '../../hooks/useRegions'

interface RegionSelectorProps {
  className?: string
  /** Dark variant for the mobile drawer (sidebar background). */
  variant?: 'default' | 'sidebar'
}

export function RegionSelector({ className = '', variant = 'default' }: RegionSelectorProps) {
  const { data: regions } = useRegions()
  const { selectedRegionId } = useSelectedRegion()
  const { activeProposal, changeRegion } = useActiveSolution()
  const { notify } = useNotifications()

  const handleChange = (regionId: string) => {
    changeRegion(regionId)
    const region = regions?.find((r) => r.id === regionId)
    if (region) {
      notify({
        tone: region.status === 'operational' ? 'info' : 'warning',
        title: activeProposal ? `${activeProposal.solutionName} → ${region.name}` : `Región principal: ${region.name}`,
        message:
          region.status === 'operational'
            ? `${region.code} · los costos se recalculan con factor ×${region.pricingFactor.toFixed(2)}.`
            : `${region.code} está degradada; considera una región operativa para producción.`,
      })
    }
  }

  const styles =
    variant === 'sidebar'
      ? 'border-white/10 bg-white/5 text-slate-200 focus:border-brand'
      : 'border-border bg-card text-text-primary hover:border-brand/40 focus:border-brand'

  return (
    <label className={`relative flex items-center ${className}`}>
      <span className="sr-only">Región seleccionada</span>
      <MapPin
        size={15}
        className={`pointer-events-none absolute left-3 ${variant === 'sidebar' ? 'text-slate-400' : 'text-brand'}`}
      />
      <select
        value={selectedRegionId}
        onChange={(e) => handleChange(e.target.value)}
        disabled={!regions}
        className={`w-full appearance-none rounded-lg border py-2 pl-9 pr-8 text-sm font-medium transition focus:outline-none ${styles}`}
      >
        {regions?.map((region) => (
          <option key={region.id} value={region.id} className="text-slate-900">
            {region.name} ({region.code})
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 text-[10px] text-text-secondary">▼</span>
    </label>
  )
}
