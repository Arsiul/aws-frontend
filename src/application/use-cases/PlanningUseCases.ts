import type { CloudProposal, NewCloudProposal, WorkspaceMode } from '../../domain/entities'
import { defaultCostItems, reconcileCostItems } from '../../domain/pricing'
import type { ICostRepository, IPlanningRepository, IWorkspaceRepository } from '../../domain/repositories'

/** Shared by every use case that adapts its output to the user's active solution. */
export async function loadActiveProposal(planningRepository: IPlanningRepository): Promise<CloudProposal | null> {
  const id = await planningRepository.getActiveId()
  return id ? ((await planningRepository.getById(id)) ?? null) : null
}

function validate(proposal: NewCloudProposal): void {
  if (!proposal.solutionName.trim()) {
    throw new Error('El nombre de la solución es obligatorio')
  }
  if (proposal.estimatedUsers <= 0) {
    throw new Error('El número estimado de usuarios debe ser mayor a 0')
  }
  if (proposal.selectedServices.length === 0) {
    throw new Error('Debe seleccionar al menos un servicio Cloud')
  }
}

export class GetCloudProposalsUseCase {
  private readonly planningRepository: IPlanningRepository

  constructor(planningRepository: IPlanningRepository) {
    this.planningRepository = planningRepository
  }

  execute(): Promise<CloudProposal[]> {
    return this.planningRepository.getAll()
  }
}

/** Registers the proposal with one unit of each billable service and makes it the active solution. */
export class RegisterCloudProposalUseCase {
  private readonly planningRepository: IPlanningRepository
  private readonly costRepository: ICostRepository

  constructor(planningRepository: IPlanningRepository, costRepository: ICostRepository) {
    this.planningRepository = planningRepository
    this.costRepository = costRepository
  }

  async execute(proposal: NewCloudProposal): Promise<CloudProposal> {
    validate(proposal)
    const catalog = await this.costRepository.getCatalog()
    const created = await this.planningRepository.create({
      ...proposal,
      costItems: defaultCostItems(proposal.selectedServices, catalog),
    })
    await this.planningRepository.setActiveId(created.id)
    return created
  }
}

/** Saves changes to a proposal. Cost lines and selected services are kept consistent: a billed
 *  service is always part of the solution. */
export class UpdateCloudProposalUseCase {
  private readonly planningRepository: IPlanningRepository

  constructor(planningRepository: IPlanningRepository) {
    this.planningRepository = planningRepository
  }

  async execute(proposal: CloudProposal): Promise<CloudProposal> {
    validate(proposal)
    const billed = proposal.costItems.map((item) => item.serviceId)
    const selectedServices = [...new Set([...proposal.selectedServices, ...billed])]
    return this.planningRepository.update({ ...proposal, selectedServices })
  }
}

/** Saves the planning-form fields of an existing proposal. The selected services are the source
 *  of truth here, so its cost lines are reconciled with them (see domain/pricing). */
export class EditCloudProposalUseCase {
  private readonly planningRepository: IPlanningRepository
  private readonly costRepository: ICostRepository

  constructor(planningRepository: IPlanningRepository, costRepository: ICostRepository) {
    this.planningRepository = planningRepository
    this.costRepository = costRepository
  }

  async execute(id: string, changes: NewCloudProposal): Promise<CloudProposal> {
    validate(changes)
    const [current, catalog] = await Promise.all([
      this.planningRepository.getById(id),
      this.costRepository.getCatalog(),
    ])
    if (!current) throw new Error('La propuesta ya no existe')

    return this.planningRepository.update({
      ...current,
      ...changes,
      costItems: reconcileCostItems(current.costItems, changes.selectedServices, catalog),
    })
  }
}

export class DeleteCloudProposalUseCase {
  private readonly planningRepository: IPlanningRepository

  constructor(planningRepository: IPlanningRepository) {
    this.planningRepository = planningRepository
  }

  execute(id: string): Promise<void> {
    return this.planningRepository.delete(id)
  }
}

export class GetActiveProposalUseCase {
  private readonly planningRepository: IPlanningRepository

  constructor(planningRepository: IPlanningRepository) {
    this.planningRepository = planningRepository
  }

  execute(): Promise<CloudProposal | null> {
    return loadActiveProposal(this.planningRepository)
  }
}

export class SetActiveProposalUseCase {
  private readonly planningRepository: IPlanningRepository

  constructor(planningRepository: IPlanningRepository) {
    this.planningRepository = planningRepository
  }

  async execute(id: string | null): Promise<CloudProposal | null> {
    if (id && !(await this.planningRepository.getById(id))) {
      throw new Error('La propuesta no existe')
    }
    await this.planningRepository.setActiveId(id)
    return loadActiveProposal(this.planningRepository)
  }
}

/** Replaces the stored proposals with the demo scenario, back in demo mode, and activates the first. */
export class LoadExampleScenarioUseCase {
  private readonly planningRepository: IPlanningRepository
  private readonly workspaceRepository: IWorkspaceRepository
  private readonly scenario: Omit<CloudProposal, 'createdAt'>[]

  constructor(
    planningRepository: IPlanningRepository,
    workspaceRepository: IWorkspaceRepository,
    scenario: Omit<CloudProposal, 'createdAt'>[],
  ) {
    this.planningRepository = planningRepository
    this.workspaceRepository = workspaceRepository
    this.scenario = scenario
  }

  async execute(): Promise<CloudProposal | null> {
    await this.workspaceRepository.setMode('demo')
    const now = Date.now()
    // Staggered timestamps keep the scenario order when listed newest first.
    const proposals = this.scenario.map((p, index) => ({
      ...p,
      createdAt: new Date(now - index * 60_000).toISOString(),
    }))
    await this.planningRepository.replaceAll(proposals)
    await this.planningRepository.setActiveId(proposals[0]?.id ?? null)
    return loadActiveProposal(this.planningRepository)
  }
}

/** Removes every proposal and the active selection and returns to the reference (demo) data. */
export class ResetWorkspaceUseCase {
  private readonly planningRepository: IPlanningRepository
  private readonly workspaceRepository: IWorkspaceRepository

  constructor(planningRepository: IPlanningRepository, workspaceRepository: IWorkspaceRepository) {
    this.planningRepository = planningRepository
    this.workspaceRepository = workspaceRepository
  }

  async execute(): Promise<void> {
    await this.planningRepository.clear()
    await this.workspaceRepository.setMode('demo')
  }
}

/** Empty workspace: no proposals and no example company data, only the AWS catalog and regions. */
export class StartBlankWorkspaceUseCase {
  private readonly planningRepository: IPlanningRepository
  private readonly workspaceRepository: IWorkspaceRepository

  constructor(planningRepository: IPlanningRepository, workspaceRepository: IWorkspaceRepository) {
    this.planningRepository = planningRepository
    this.workspaceRepository = workspaceRepository
  }

  async execute(): Promise<void> {
    await this.planningRepository.clear()
    await this.workspaceRepository.setMode('blank')
  }
}

export class GetWorkspaceModeUseCase {
  private readonly workspaceRepository: IWorkspaceRepository

  constructor(workspaceRepository: IWorkspaceRepository) {
    this.workspaceRepository = workspaceRepository
  }

  execute(): Promise<WorkspaceMode> {
    return this.workspaceRepository.getMode()
  }
}
