import { Lightbulb, Rocket, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatNumber } from '../../../shared/utils/format'
import { useActiveSolution } from '../../context/activeSolution'
import { AVAILABILITY_LABELS } from '../../labels'

interface SolutionBannerProps {
  /** What this module shows about the solution, e.g. "Costos calculados con sus recursos". */
  detail?: string
}

/** Tells the viewer whose data a module is showing: the active solution or the reference catalog. */
export function SolutionBanner({ detail }: SolutionBannerProps) {
  const { activeProposal, isLoading, loadExample } = useActiveSolution()
  if (isLoading) return null

  if (!activeProposal) {
    return (
      <div className="flex animate-fadeIn flex-col gap-3 rounded-card border border-dashed border-brand/40 bg-brand/5 p-4 md:flex-row md:items-center md:justify-between print:hidden">
        <div className="flex items-start gap-3">
          <Lightbulb size={18} className="mt-0.5 shrink-0 text-brand" />
          <div>
            <p className="text-sm font-semibold text-text-primary">Vista de referencia</p>
            <p className="text-xs text-text-secondary">
              No hay una solución activa. Registra o activa una propuesta para que todos los módulos muestren tus
              propios datos.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link to="/planning" className="btn-secondary">
            Ir a Planificación
          </Link>
          <button type="button" onClick={loadExample} className="btn-primary">
            <Sparkles size={16} /> Cargar caso de ejemplo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex animate-fadeIn flex-col gap-3 rounded-card border border-brand/30 bg-brand/5 p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand text-white">
          <Rocket size={18} />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">Solución activa</p>
          <p className="truncate text-base font-semibold text-text-primary">{activeProposal.solutionName}</p>
          <p className="text-xs text-text-secondary">
            {activeProposal.applicationType} · {formatNumber(activeProposal.estimatedUsers)} usuarios ·{' '}
            {AVAILABILITY_LABELS[activeProposal.availabilityLevel]}
            {detail && <> · {detail}</>}
          </p>
        </div>
      </div>
      <Link to="/planning" className="btn-secondary shrink-0 print:hidden">
        Cambiar solución
      </Link>
    </div>
  )
}
