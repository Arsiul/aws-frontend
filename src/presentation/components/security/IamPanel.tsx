import { FileJson, KeyRound, ShieldAlert, ShieldCheck, User, Users, UserSquare2, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import type { IamIdentity, IamIdentityType } from '../../../domain/entities'
import { IAM_TYPE_LABELS, IAM_TYPE_PLURAL_LABELS, SECURITY_STATUS_LABELS } from '../../labels'
import { FilterChips } from '../common/FilterChips'
import { Panel } from '../common/Panel'
import { StatusBadge, securityStatusTone } from '../common/StatusBadge'

const TYPE_ICONS: Record<IamIdentityType, LucideIcon> = {
  user: User,
  group: Users,
  role: UserSquare2,
  policy: FileJson,
}

const TYPE_ORDER: IamIdentityType[] = ['user', 'group', 'role', 'policy']

interface IamPanelProps {
  identities: IamIdentity[]
}

export function IamPanel({ identities }: IamPanelProps) {
  const [filter, setFilter] = useState<IamIdentityType | 'all'>('all')
  const visible = filter === 'all' ? identities : identities.filter((i) => i.type === filter)
  const users = identities.filter((i) => i.type === 'user')
  const usersWithMfa = users.filter((u) => u.mfaEnabled).length

  return (
    <Panel
      title="Gestión de identidades y accesos (IAM)"
      icon={KeyRound}
      description="Quién puede acceder (usuarios, grupos y roles) y qué puede hacer (políticas)."
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {TYPE_ORDER.map((type) => {
          const Icon = TYPE_ICONS[type]
          return (
            <div key={type} className="rounded-xl border border-border bg-background p-3">
              <Icon size={16} className="text-brand" />
              <p className="mt-2 text-xl font-bold text-text-primary">
                {identities.filter((i) => i.type === type).length}
              </p>
              <p className="text-xs text-text-secondary">{IAM_TYPE_PLURAL_LABELS[type]}</p>
            </div>
          )
        })}
        <div className="col-span-2 rounded-xl border border-border bg-background p-3 md:col-span-1">
          {usersWithMfa === users.length ? (
            <ShieldCheck size={16} className="text-security" />
          ) : (
            <ShieldAlert size={16} className="text-cost" />
          )}
          <p className="mt-2 text-xl font-bold text-text-primary">
            {usersWithMfa}/{users.length}
          </p>
          <p className="text-xs text-text-secondary">Usuarios con MFA</p>
        </div>
      </div>

      <div className="mt-5">
        <FilterChips
          ariaLabel="Filtrar identidades IAM"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'Todos', count: identities.length },
            ...TYPE_ORDER.map((type) => ({
              value: type,
              label: IAM_TYPE_PLURAL_LABELS[type],
              count: identities.filter((i) => i.type === type).length,
            })),
          ]}
        />
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-text-secondary">
              <th className="py-2 pr-4 font-medium">Identidad</th>
              <th className="py-2 pr-4 font-medium">Tipo</th>
              <th className="py-2 pr-4 font-medium">Políticas asociadas</th>
              <th className="py-2 pr-4 font-medium">MFA</th>
              <th className="py-2 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((identity) => {
              const Icon = TYPE_ICONS[identity.type]
              return (
                <tr key={identity.id} className="animate-fadeIn border-b border-border align-top last:border-0">
                  <td className="py-3 pr-4">
                    <div className="flex items-start gap-2">
                      <Icon size={16} className="mt-0.5 shrink-0 text-brand" />
                      <div>
                        <p className="font-mono text-[13px] font-medium text-text-primary">{identity.name}</p>
                        <p className="text-xs text-text-secondary">{identity.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-text-secondary">{IAM_TYPE_LABELS[identity.type]}</td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-1">
                      {identity.attachedPolicies.length === 0 && <span className="text-text-secondary">—</span>}
                      {identity.attachedPolicies.map((policy) => (
                        <span key={policy} className="rounded bg-background px-1.5 py-0.5 font-mono text-[11px] text-text-secondary">
                          {policy}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-text-secondary">
                    {identity.mfaEnabled === undefined ? (
                      '—'
                    ) : identity.mfaEnabled ? (
                      <span className="font-medium text-security">Activo</span>
                    ) : (
                      <span className="font-medium text-alert">Inactivo</span>
                    )}
                  </td>
                  <td className="py-3">
                    <StatusBadge label={SECURITY_STATUS_LABELS[identity.status]} tone={securityStatusTone(identity.status)} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}
