import type { Region } from '../../domain/entities'
import type { IRegionRepository } from '../../domain/repositories'

export class GetRegionsUseCase {
  private readonly regionRepository: IRegionRepository

  constructor(regionRepository: IRegionRepository) {
    this.regionRepository = regionRepository
  }

  execute(): Promise<Region[]> {
    return this.regionRepository.getAll()
  }
}
