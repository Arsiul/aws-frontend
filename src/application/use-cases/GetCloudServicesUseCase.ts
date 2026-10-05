import type { CloudService } from '../../domain/entities'
import type { ICloudServiceRepository, IPlanningRepository } from '../../domain/repositories'
import { applySolutionUsage } from '../../domain/solution'
import { loadActiveProposal } from './PlanningUseCases'

/** Catalog whose utilization status reflects the active solution (if any). */
export class GetCloudServicesUseCase {
  private readonly serviceRepository: ICloudServiceRepository
  private readonly planningRepository: IPlanningRepository

  constructor(serviceRepository: ICloudServiceRepository, planningRepository: IPlanningRepository) {
    this.serviceRepository = serviceRepository
    this.planningRepository = planningRepository
  }

  async execute(): Promise<CloudService[]> {
    const [services, proposal] = await Promise.all([
      this.serviceRepository.getAll(),
      loadActiveProposal(this.planningRepository),
    ])
    return applySolutionUsage(services, proposal)
  }
}
