import type { CloudProposal } from '../../domain/entities'
import type { IPlanningRepository } from '../../domain/repositories'

export class GetCloudProposalsUseCase {
  private readonly planningRepository: IPlanningRepository

  constructor(planningRepository: IPlanningRepository) {
    this.planningRepository = planningRepository
  }

  execute(): Promise<CloudProposal[]> {
    return this.planningRepository.getAll()
  }
}

export class RegisterCloudProposalUseCase {
  private readonly planningRepository: IPlanningRepository

  constructor(planningRepository: IPlanningRepository) {
    this.planningRepository = planningRepository
  }

  execute(proposal: Omit<CloudProposal, 'id' | 'createdAt'>): Promise<CloudProposal> {
    if (!proposal.solutionName.trim()) {
      throw new Error('El nombre de la solución es obligatorio')
    }
    if (proposal.estimatedUsers <= 0) {
      throw new Error('El número estimado de usuarios debe ser mayor a 0')
    }
    if (proposal.selectedServices.length === 0) {
      throw new Error('Debe seleccionar al menos un servicio Cloud')
    }
    return this.planningRepository.create(proposal)
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
