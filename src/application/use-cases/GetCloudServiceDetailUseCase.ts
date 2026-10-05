import type { CloudServiceDetail } from '../../domain/entities'
import { HOURS_PER_MONTH } from '../../domain/pricing'
import type { ICloudServiceRepository, IRegionRepository } from '../../domain/repositories'

export class GetCloudServiceDetailUseCase {
  private readonly serviceRepository: ICloudServiceRepository
  private readonly regionRepository: IRegionRepository

  constructor(serviceRepository: ICloudServiceRepository, regionRepository: IRegionRepository) {
    this.serviceRepository = serviceRepository
    this.regionRepository = regionRepository
  }

  async execute(serviceId: string): Promise<CloudServiceDetail | null> {
    const [service, regions] = await Promise.all([
      this.serviceRepository.getById(serviceId),
      this.regionRepository.getAll(),
    ])
    if (!service) return null

    return {
      service,
      deployedRegions: regions.filter((region) => region.servicesDeployed.includes(service.id)),
      monthlyCost: service.hourlyCost * HOURS_PER_MONTH,
    }
  }
}
