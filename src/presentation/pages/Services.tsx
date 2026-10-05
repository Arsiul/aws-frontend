import { LayoutGrid, Search, SearchX, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import type { ServiceCategory, UtilizationStatus } from '../../domain/entities'
import { ErrorState, LoadingState } from '../components/common/AsyncState'
import { FilterChips } from '../components/common/FilterChips'
import { PageHeader } from '../components/common/PageHeader'
import { SolutionBanner } from '../components/common/SolutionBanner'
import { ServiceCard } from '../components/common/ServiceCard'
import { useCloudServices } from '../hooks/useCloudServices'
import { SERVICE_CATEGORY_LABELS, UTILIZATION_LABELS } from '../labels'

type CategoryFilter = ServiceCategory | 'all'
type StatusFilter = UtilizationStatus | 'all'

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

export function Services() {
  const { data: services, error } = useCloudServices()
  // Filters live in the URL so they survive reloads and the dashboard chart can link to a category.
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const category = (params.get('category') ?? 'all') as CategoryFilter
  const status = (params.get('status') ?? 'all') as StatusFilter

  const setParam = (key: string, value: string) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (!value || value === 'all') next.delete(key)
        else next.set(key, value)
        return next
      },
      { replace: true },
    )
  }

  if (error) return <ErrorState message={error} />
  if (!services) return <LoadingState label="Cargando catálogo de servicios AWS…" />

  const all = services ?? []
  const needle = normalize(query.trim())
  const matchesQuery = all.filter(
    (s) =>
      !needle ||
      [s.name, s.description, s.mainFunction, SERVICE_CATEGORY_LABELS[s.category]].some((field) =>
        normalize(field).includes(needle),
      ),
  )
  const visible = matchesQuery.filter(
    (s) => (category === 'all' || s.category === category) && (status === 'all' || s.status === status),
  )
  const hasFilters = Boolean(query) || category !== 'all' || status !== 'all'

  const categoryOptions = [
    { value: 'all' as CategoryFilter, label: 'Todas', count: matchesQuery.length },
    ...(Object.keys(SERVICE_CATEGORY_LABELS) as ServiceCategory[]).map((value) => ({
      value: value as CategoryFilter,
      label: SERVICE_CATEGORY_LABELS[value],
      count: matchesQuery.filter((s) => s.category === value).length,
    })),
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        icon={LayoutGrid}
        title="Catálogo de servicios AWS"
        description="Servicios disponibles para la solución Cloud, con su categoría, función y estado de utilización."
      />

      <SolutionBanner detail="el estado de utilización refleja sus servicios" />

      <div className="space-y-4 rounded-card border border-border bg-card p-5 shadow-card">
        <div className="flex flex-col gap-3 md:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Buscar servicio</span>
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="search"
              value={query}
              onChange={(e) => setParam('q', e.target.value)}
              placeholder="Buscar por nombre, función o descripción…"
              className="input pl-9"
            />
          </label>
          <label className="md:w-56">
            <span className="sr-only">Estado de utilización</span>
            <select value={status} onChange={(e) => setParam('status', e.target.value)} className="input">
              <option value="all">Todos los estados</option>
              {(Object.keys(UTILIZATION_LABELS) as UtilizationStatus[]).map((value) => (
                <option key={value} value={value}>
                  {UTILIZATION_LABELS[value]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <FilterChips
          options={categoryOptions}
          value={category}
          onChange={(value) => setParam('category', value)}
          ariaLabel="Filtrar por categoría"
        />

        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>
            {visible.length} de {all.length} servicios
          </span>
          {hasFilters && (
            <button
              type="button"
              onClick={() => setParams({}, { replace: true })}
              className="flex items-center gap-1 font-medium text-brand hover:underline"
            >
              <X size={13} /> Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-border p-10 text-center text-sm text-text-secondary">
          <SearchX size={24} />
          No hay servicios que coincidan con la búsqueda.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  )
}
