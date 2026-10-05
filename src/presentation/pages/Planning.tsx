import { ClipboardList, Eraser, Pencil, Rocket, RotateCcw, Save, Send, Sparkles, X } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import type { AvailabilityLevel, NewCloudProposal } from '../../domain/entities'
import { ErrorState, LoadingState } from '../components/common/AsyncState'
import { FormField } from '../components/common/FormField'
import { PageHeader } from '../components/common/PageHeader'
import { Panel } from '../components/common/Panel'
import { ProposalCard } from '../components/common/ProposalCard'
import { useActiveSolution } from '../context/activeSolution'
import { useSelectedRegion } from '../context/selectedRegion'
import { useCloudServices } from '../hooks/useCloudServices'
import { useRegions } from '../hooks/useRegions'
import { AVAILABILITY_LABELS, SERVICE_CATEGORY_LABELS, shortServiceName } from '../labels'

const APPLICATION_TYPES = [
  'Aplicación web',
  'E-commerce',
  'API / microservicios',
  'Backend de aplicación móvil',
  'Sistema interno (ERP / CRM)',
  'Análisis de datos',
]

const MIGRATION_GOALS = [
  'Reducir costos (de CapEx a OpEx)',
  'Escalabilidad bajo demanda',
  'Alta disponibilidad',
  'Modernización de la aplicación',
  'Expansión global',
  'Recuperación ante desastres',
]

const AVAILABILITY_OPTIONS = Object.entries(AVAILABILITY_LABELS) as [AvailabilityLevel, string][]

type ProposalForm = NewCloudProposal

function emptyForm(regionId: string): ProposalForm {
  return {
    solutionName: '',
    applicationType: '',
    description: '',
    regionId,
    estimatedUsers: 1000,
    availabilityLevel: 'high',
    selectedServices: [],
    migrationGoal: '',
  }
}

export function Planning() {
  const { selectedRegionId } = useSelectedRegion()
  const { data: regions } = useRegions()
  const { data: services } = useCloudServices()
  const {
    proposals,
    activeProposal,
    isLoading,
    error,
    register,
    edit,
    remove,
    activate,
    loadExample,
    startBlank,
    isSubmitting,
    submitError,
  } = useActiveSolution()
  const [form, setForm] = useState<ProposalForm>(() => emptyForm(selectedRegionId))
  // Id of the proposal loaded in the form for editing; null means the form creates a new one.
  const [editingId, setEditingId] = useState<string | null>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const editingProposal = proposals.find((p) => p.id === editingId)

  const serviceNames = Object.fromEntries((services ?? []).map((s) => [s.id, shortServiceName(s.name)]))
  const regionLabel = (id: string) => {
    const region = regions?.find((r) => r.id === id)
    return region ? `${region.name} (${region.code})` : id
  }

  const update = <K extends keyof ProposalForm>(key: K, value: ProposalForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const toggleService = (serviceId: string) => {
    setForm((f) => ({
      ...f,
      selectedServices: f.selectedServices.includes(serviceId)
        ? f.selectedServices.filter((id) => id !== serviceId)
        : [...f.selectedServices, serviceId],
    }))
  }

  const resetForm = (regionId = selectedRegionId) => {
    setEditingId(null)
    setForm(emptyForm(regionId))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const ok = editingId ? await edit(editingId, form) : await register(form)
    if (ok) resetForm(form.regionId)
  }

  const startEditing = (id: string) => {
    const proposal = proposals.find((p) => p.id === id)
    if (!proposal) return
    const { solutionName, applicationType, description, regionId, estimatedUsers, availabilityLevel, selectedServices, migrationGoal } = proposal
    setForm({ solutionName, applicationType, description, regionId, estimatedUsers, availabilityLevel, selectedServices, migrationGoal })
    setEditingId(id)
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleDelete = async (id: string) => {
    const proposal = proposals.find((p) => p.id === id)
    if (!proposal || !window.confirm(`¿Eliminar la propuesta "${proposal.solutionName}"?`)) return
    if (id === editingId) resetForm()
    await remove(id)
  }

  const handleLoadExample = async () => {
    if (proposals.length > 0 && !window.confirm('El caso de ejemplo reemplaza las propuestas actuales. ¿Continuar?')) return
    await loadExample()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Rocket}
        title="Planificación Cloud"
        description="Registra tu propia solución Cloud y actívala: el Dashboard, Costos, Red, Seguridad e Infraestructura se calculan a partir de ella."
        action={
          <>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('¿Empezar en blanco? Se borrarán todas las propuestas y no habrá datos de ejemplo.')) startBlank()
              }}
              className="btn-secondary"
            >
              <Eraser size={16} /> Empezar en blanco
            </button>
            <button type="button" onClick={handleLoadExample} className="btn-secondary">
              <Sparkles size={16} /> Cargar caso de ejemplo
            </button>
          </>
        }
      />

      <div ref={formRef} className="scroll-mt-6">
        <Panel
          title={editingProposal ? `Editar: ${editingProposal.solutionName}` : 'Nueva propuesta'}
          icon={editingProposal ? Pencil : ClipboardList}
          iconClassName={editingProposal ? 'text-cost' : 'text-brand'}
          className={editingProposal ? 'border-cost/60 ring-2 ring-cost/20' : ''}
          description={
            editingProposal
              ? editingProposal.id === activeProposal?.id
                ? 'Es la solución activa: al guardar, todos los módulos se actualizan. Los recursos de Costos se ajustan a los servicios elegidos.'
                : 'Al guardar se actualiza la propuesta. Los recursos de Costos se ajustan a los servicios elegidos.'
              : 'Todos los campos son obligatorios. Al registrarla se convierte en la solución activa.'
          }
          action={
            editingProposal && (
              <button type="button" onClick={() => resetForm()} className="btn-secondary">
                <X size={16} /> Cancelar edición
              </button>
            )
          }
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Nombre de la solución">
                <input
                  required
                  value={form.solutionName}
                  onChange={(e) => update('solutionName', e.target.value)}
                  className="input"
                  placeholder="Ej. Plataforma de ventas en línea"
                />
              </FormField>

              <FormField label="Tipo de aplicación">
                <select
                  required
                  value={form.applicationType}
                  onChange={(e) => update('applicationType', e.target.value)}
                  className="input"
                >
                  <option value="" disabled>
                    Selecciona un tipo
                  </option>
                  {APPLICATION_TYPES.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </FormField>
            </div>

            <FormField label="Descripción">
              <textarea
                required
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                className="input min-h-20"
                placeholder="Describe brevemente la solución propuesta"
              />
            </FormField>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField label="Región seleccionada">
                <select
                  required
                  value={form.regionId}
                  onChange={(e) => update('regionId', e.target.value)}
                  className="input"
                >
                  {regions?.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name} ({region.code})
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Número estimado de usuarios">
                <input
                  type="number"
                  min={1}
                  required
                  value={form.estimatedUsers}
                  onChange={(e) => update('estimatedUsers', Number(e.target.value))}
                  className="input"
                />
              </FormField>

              <FormField label="Nivel de disponibilidad requerido">
                <select
                  value={form.availabilityLevel}
                  onChange={(e) => update('availabilityLevel', e.target.value as AvailabilityLevel)}
                  className="input"
                >
                  {AVAILABILITY_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            {/* fieldset, not <label>: a label wrapping buttons would toggle the first one on click. */}
            <fieldset>
              <legend className="mb-1.5 text-xs font-medium text-text-secondary">
                Servicios Cloud seleccionados ({form.selectedServices.length})
              </legend>
              <div className="flex flex-wrap gap-2">
                {services?.map((service) => {
                  const isSelected = form.selectedServices.includes(service.id)
                  return (
                    <button
                      type="button"
                      key={service.id}
                      aria-pressed={isSelected}
                      onClick={() => toggleService(service.id)}
                      title={`${SERVICE_CATEGORY_LABELS[service.category]} · ${service.mainFunction}`}
                      className={`chip ${isSelected ? 'chip-active' : 'chip-idle'}`}
                    >
                      {shortServiceName(service.name)}
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <FormField label="Objetivo de la migración">
              <select
                required
                value={form.migrationGoal}
                onChange={(e) => update('migrationGoal', e.target.value)}
                className="input"
              >
                <option value="" disabled>
                  Selecciona un objetivo
                </option>
                {MIGRATION_GOALS.map((goal) => (
                  <option key={goal}>{goal}</option>
                ))}
              </select>
            </FormField>

            {submitError && <ErrorState message={submitError} />}

            <div className="flex flex-wrap gap-2">
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {editingProposal ? <Save size={16} /> : <Send size={16} />}
                {isSubmitting ? 'Guardando…' : editingProposal ? 'Guardar cambios' : 'Registrar propuesta'}
              </button>
              {editingProposal ? (
                <button type="button" onClick={() => resetForm()} className="btn-secondary">
                  <X size={16} /> Cancelar
                </button>
              ) : (
                <button type="button" onClick={() => resetForm()} className="btn-secondary">
                  <RotateCcw size={16} /> Limpiar
                </button>
              )}
            </div>
          </form>
        </Panel>
      </div>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
          <ClipboardList size={18} className="text-brand" />
          Propuestas registradas ({proposals.length})
        </h2>

        {isLoading && proposals.length === 0 && <LoadingState label="Cargando propuestas…" />}
        {error && <ErrorState message={error} />}

        {!isLoading && proposals.length === 0 && (
          <p className="rounded-card border border-dashed border-border p-8 text-center text-sm text-text-secondary">
            Aún no hay propuestas registradas. Completa el formulario para crear la primera.
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {proposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              regionName={regionLabel(proposal.regionId)}
              serviceNames={serviceNames}
              isActive={proposal.id === activeProposal?.id}
              isEditing={proposal.id === editingId}
              onActivate={activate}
              onEdit={startEditing}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
