import type { CloudServiceDetail } from '../../domain/entities'
import { HOURS_PER_MONTH } from '../../domain/pricing'
import type { ICloudServiceRepository, IPlanningRepository, IRegionRepository } from '../../domain/repositories'
import { applySolutionUsage } from '../../domain/solution'
import { loadActiveProposal } from './PlanningUseCases'

export class GetCloudServiceDetailUseCase {
  private readonly serviceRepository: ICloudServiceRepository
  private readonly regionRepository: IRegionRepository
  private readonly planningRepository: IPlanningRepository

  constructor(
    serviceRepository: ICloudServiceRepository,
    regionRepository: IRegionRepository,
    planningRepository: IPlanningRepository,
  ) {
    this.serviceRepository = serviceRepository
    this.regionRepository = regionRepository
    this.planningRepository = planningRepository
  }

  async execute(serviceId: string): Promise<CloudServiceDetail | null> {
    const [found, regions, proposal] = await Promise.all([
      this.serviceRepository.getById(serviceId),
      this.regionRepository.getAll(),
      loadActiveProposal(this.planningRepository),
    ])
    if (!found) return null
    const [service] = applySolutionUsage([found], proposal)

    return {
      service,
      deployedRegions: regions.filter(
        (region) =>
          region.servicesDeployed.includes(service.id) ||
          (proposal?.regionId === region.id && proposal.selectedServices.includes(service.id)),
      ),
      monthlyCost: service.hourlyCost * HOURS_PER_MONTH,
    }
  }
}
