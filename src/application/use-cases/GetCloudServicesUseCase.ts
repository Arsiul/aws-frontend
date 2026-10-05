import type { CloudService } from '../../domain/entities'
import type { ICloudServiceRepository } from '../../domain/repositories'

export class GetCloudServicesUseCase {
  private readonly serviceRepository: ICloudServiceRepository

  constructor(serviceRepository: ICloudServiceRepository) {
    this.serviceRepository = serviceRepository
  }

  execute(): Promise<CloudService[]> {
    return this.serviceRepository.getAll()
  }
}
