import { AlertTriangle, CheckCircle2, ListChecks, ScanSearch, ShieldCheck, XCircle } from 'lucide-react'
import { useState } from 'react'
import type { SecurityCategory } from '../../domain/entities'
import { ErrorState, LoadingState } from '../components/common/AsyncState'
import { FilterChips } from '../components/common/FilterChips'
import { PageHeader } from '../components/common/PageHeader'
import { Panel } from '../components/common/Panel'
import { SecurityCard } from '../components/common/SecurityCard'
import { SolutionBanner } from '../components/common/SolutionBanner'
import { StatCard } from '../components/common/StatCard'
import { IamPanel } from '../components/security/IamPanel'
import { SharedResponsibilityPanel } from '../components/security/SharedResponsibilityPanel'
import { useIamIdentities, useSecurityChecks, useSharedResponsibility } from '../hooks/useSecurityChecks'
import { SECURITY_CATEGORY_LABELS } from '../labels'

type CategoryFilter = SecurityCategory | 'all'

export function Security() {
  const { data: checks, error } = useSecurityChecks()
  const { data: identities } = useIamIdentities()
  const { data: responsibility } = useSharedResponsibility()
  const [category, setCategory] = useState<CategoryFilter>('all')

  if (error) return <ErrorState message={error} />
  if (!checks) return <LoadingState label="Cargando panel de seguridad…" />

  const allChecks = checks
  // Controls evaluated on the solution's design come first; the rest are account-level.
  const solutionChecks = allChecks.filter((c) => c.id.startsWith('solution-'))
  const accountChecks = allChecks.filter((c) => !c.id.startsWith('solution-'))
  const ok = allChecks.filter((c) => c.status === 'ok').length
  const warning = allChecks.filter((c) => c.status === 'warning').length
  const critical = allChecks.filter((c) => c.status === 'critical').length
  const visibleChecks = category === 'all' ? accountChecks : accountChecks.filter((c) => c.category === category)

  const categoryOptions = [
    { value: 'all' as CategoryFilter, label: 'Todos', count: accountChecks.length },
    ...(Object.keys(SECURITY_CATEGORY_LABELS) as SecurityCategory[]).map((value) => ({
      value: value as CategoryFilter,
      label: SECURITY_CATEGORY_LABELS[value],
      count: accountChecks.filter((c) => c.category === value).length,
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

      <SolutionBanner detail="sus controles se evalúan según los servicios elegidos" />

      {solutionChecks.length > 0 && (
        <Panel
          title="Evaluación de tu solución"
          icon={ScanSearch}
          description="Controles calculados a partir del diseño: IAM, disponibilidad, protección perimetral, monitoreo y datos."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {solutionChecks.map((check) => (
              <SecurityCard key={check.id} item={check} />
            ))}
          </div>
        </Panel>
      )}

      {responsibility && <SharedResponsibilityPanel model={responsibility} />}

      {identities && <IamPanel identities={identities} />}

      {accountChecks.length > 0 && (
      <Panel
        title={solutionChecks.length > 0 ? 'Controles de la cuenta' : 'Controles de seguridad'}
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
      )}
    </div>
  )
}
