import { Building2, Handshake, Scale, UserCog, type LucideIcon } from 'lucide-react'
import type { ResponsibilityItem, SharedResponsibilityModel } from '../../../domain/entities'
import { Panel } from '../common/Panel'

interface SharedResponsibilityPanelProps {
  model: SharedResponsibilityModel
}

export function SharedResponsibilityPanel({ model }: SharedResponsibilityPanelProps) {
  return (
    <Panel
      title="Modelo de responsabilidad compartida"
      icon={Scale}
      description="AWS protege la seguridad DE la nube; el cliente es responsable de la seguridad EN la nube."
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Column
          icon={UserCog}
          title="Cliente"
          subtitle="Seguridad EN la nube"
          items={model.customer}
          accent="border-brand/30 bg-brand/5"
          iconColor="bg-brand text-white"
        />
        <Column
          icon={Building2}
          title="AWS"
          subtitle="Seguridad DE la nube"
          items={model.aws}
          accent="border-cost/40 bg-cost/5"
          iconColor="bg-cost text-white"
        />
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-border p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <Handshake size={16} className="text-security" />
          Controles compartidos
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          {model.shared.map((item) => (
            <div key={item.title}>
              <p className="text-sm font-medium text-text-primary">{item.title}</p>
              <p className="text-xs text-text-secondary">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  )
}

interface ColumnProps {
  icon: LucideIcon
  title: string
  subtitle: string
  items: ResponsibilityItem[]
  accent: string
  iconColor: string
}

function Column({ icon: Icon, title, subtitle, items, accent, iconColor }: ColumnProps) {
  return (
    <div className={`rounded-xl border p-4 ${accent}`}>
      <div className="flex items-center gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconColor}`}>
          <Icon size={18} />
        </span>
        <div>
          <p className="text-base font-semibold text-text-primary">{title}</p>
          <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">{subtitle}</p>
        </div>
      </div>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item.title} className="rounded-lg bg-card p-3 shadow-card">
            <p className="text-sm font-medium text-text-primary">{item.title}</p>
            <p className="text-xs text-text-secondary">{item.description}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
