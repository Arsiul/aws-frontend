import type { RegionConnection } from '../../domain/entities'
import type { IRegionRepository } from '../../domain/repositories'

export class GetRegionConnectionsUseCase {
  private readonly regionRepository: IRegionRepository

  constructor(regionRepository: IRegionRepository) {
    this.regionRepository = regionRepository
  }

  execute(): Promise<RegionConnection[]> {
    return this.regionRepository.getConnections()
  }
}
