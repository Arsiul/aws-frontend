import { AlertTriangle, CheckCircle2, ListChecks, ShieldCheck, XCircle } from 'lucide-react'
import { useState } from 'react'
import type { SecurityCategory } from '../../domain/entities'
import { ErrorState, LoadingState } from '../components/common/AsyncState'
import { FilterChips } from '../components/common/FilterChips'
import { PageHeader } from '../components/common/PageHeader'
import { Panel } from '../components/common/Panel'
import { SecurityCard } from '../components/common/SecurityCard'
import { StatCard } from '../components/common/StatCard'
import { IamPanel } from '../components/security/IamPanel'
import { SharedResponsibilityPanel } from '../components/security/SharedResponsibilityPanel'
import { useIamIdentities, useSecurityChecks, useSharedResponsibility } from '../hooks/useSecurityChecks'
import { SECURITY_CATEGORY_LABELS } from '../labels'

type CategoryFilter = SecurityCategory | 'all'

export function Security() {
  const { data: checks, isLoading, error } = useSecurityChecks()
  const { data: identities } = useIamIdentities()
  const { data: responsibility } = useSharedResponsibility()
  const [category, setCategory] = useState<CategoryFilter>('all')

  if (isLoading) return <LoadingState label="Cargando panel de seguridad…" />
  if (error) return <ErrorState message={error} />

  const allChecks = checks ?? []
  const ok = allChecks.filter((c) => c.status === 'ok').length
  const warning = allChecks.filter((c) => c.status === 'warning').length
  const critical = allChecks.filter((c) => c.status === 'critical').length
  const visibleChecks = category === 'all' ? allChecks : allChecks.filter((c) => c.category === category)

  const categoryOptions = [
    { value: 'all' as CategoryFilter, label: 'Todos', count: allChecks.length },
    ...(Object.keys(SECURITY_CATEGORY_LABELS) as SecurityCategory[]).map((value) => ({
      value: value as CategoryFilter,
      label: SECURITY_CATEGORY_LABELS[value],
      count: allChecks.filter((c) => c.category === value).length,
    })),
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ShieldCheck}
        title="Seguridad y cumplimiento"
        description="Responsabilidad compartida, IAM, protección de cuentas, protección de datos y cumplimiento."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Controles correctos" value={String(ok)} icon={CheckCircle2} accent="security" hint="Verde · correcto" />
        <StatCard label="Requieren revisión" value={String(warning)} icon={AlertTriangle} accent="cost" hint="Amarillo · revisar" />
        <StatCard label="Problemas detectados" value={String(critical)} icon={XCircle} accent="alert" hint="Rojo · problema" />
      </div>

      {responsibility && <SharedResponsibilityPanel model={responsibility} />}

      {identities && <IamPanel identities={identities} />}

      <Panel
        title="Controles de seguridad"
        icon={ListChecks}
        description="Estado de cada control según el semáforo: verde, amarillo o rojo."
      >
        <FilterChips options={categoryOptions} value={category} onChange={setCategory} ariaLabel="Filtrar por categoría" />
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleChecks.map((check) => (
            <SecurityCard key={check.id} item={check} />
          ))}
        </div>
      </Panel>
    </div>
  )
}
