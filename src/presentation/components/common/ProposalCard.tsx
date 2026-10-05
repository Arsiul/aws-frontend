import { CalendarDays, CheckCircle2, MapPin, Power, Target, Trash2, Users } from 'lucide-react'
import type { CloudProposal } from '../../../domain/entities'
import { formatDate, formatNumber } from '../../../shared/utils/format'
import { AVAILABILITY_LABELS } from '../../labels'
import { StatusBadge } from './StatusBadge'

const AVAILABILITY_TONE = { standard: 'neutral', high: 'info', critical: 'warning' } as const

interface ProposalCardProps {
  proposal: CloudProposal
  regionName: string
  serviceNames: Record<string, string>
  isActive?: boolean
  onActivate?: (id: string | null) => void
  onDelete?: (id: string) => void
}

export function ProposalCard({ proposal, regionName, serviceNames, isActive, onActivate, onDelete }: ProposalCardProps) {
  return (
    <article
      className={`flex animate-fadeInUp flex-col rounded-card border bg-card p-5 shadow-card transition-all duration-200 hover:shadow-md ${
        isActive ? 'border-brand ring-2 ring-brand/20' : 'border-border'
      }`}
    >
      {isActive && (
        <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-brand">
          <CheckCircle2 size={14} /> Solución activa en todos los módulos
        </p>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-text-primary">{proposal.solutionName}</h3>
          <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">{proposal.applicationType}</p>
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(proposal.id)}
            aria-label={`Eliminar propuesta ${proposal.solutionName}`}
            className="rounded-lg p-1.5 text-text-secondary transition-colors duration-200 hover:bg-alert/10 hover:text-alert"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <p className="mt-3 text-sm text-text-secondary">{proposal.description}</p>

      <dl className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <InfoRow icon={MapPin} label="Región" value={regionName} />
        <InfoRow icon={Users} label="Usuarios" value={formatNumber(proposal.estimatedUsers)} />
        <InfoRow icon={Target} label="Objetivo" value={proposal.migrationGoal} />
        <InfoRow icon={CalendarDays} label="Registrado" value={formatDate(proposal.createdAt)} />
      </dl>

      <div className="mt-4">
        <StatusBadge
          label={AVAILABILITY_LABELS[proposal.availabilityLevel]}
          tone={AVAILABILITY_TONE[proposal.availabilityLevel]}
        />
      </div>

      <div className="mt-4 border-t border-border pt-3">
        <p className="text-xs font-medium text-text-secondary">
          Servicios seleccionados ({proposal.selectedServices.length})
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {proposal.selectedServices.map((id) => (
            <span key={id} className="rounded-md bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand">
              {serviceNames[id] ?? id}
            </span>
          ))}
        </div>
      </div>

      {onActivate && (
        <div className="mt-auto pt-4 print:hidden">
          <button
            type="button"
            onClick={() => onActivate(isActive ? null : proposal.id)}
            className={`w-full ${isActive ? 'btn-secondary' : 'btn-primary'}`}
          >
            <Power size={15} />
            {isActive ? 'Desactivar' : 'Activar en todos los módulos'}
          </button>
        </div>
      )}
    </article>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <Icon size={14} className="mt-0.5 shrink-0 text-text-secondary" />
      <div className="min-w-0">
        <dt className="text-[11px] uppercase tracking-wide text-text-secondary">{label}</dt>
        <dd className="truncate font-medium text-text-primary" title={value}>
          {value}
        </dd>
      </div>
    </div>
  )
}
