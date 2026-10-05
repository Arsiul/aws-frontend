import type { FailoverResult, Region } from '../../domain/entities'
import type { IRegionRepository } from '../../domain/repositories'
import { nearestOperationalRegion } from '../../domain/regions'

/**
 * Business rule: when a region goes down, the optimal fallback is the closest
 * region (great-circle distance) that is still operational. This mirrors how
 * Route 53 latency-based / geoproximity routing picks a healthy target.
 */
export class SimulateRegionFailoverUseCase {
  private readonly regionRepository: IRegionRepository

  constructor(regionRepository: IRegionRepository) {
    this.regionRepository = regionRepository
  }

  async execute(downRegionId: string, overrideRegions?: Region[]): Promise<FailoverResult> {
    const regions = overrideRegions ?? (await this.regionRepository.getAll())
    const downRegion = regions.find((r) => r.id === downRegionId)

    if (!downRegion) {
      throw new Error(`Region ${downRegionId} not found`)
    }

    const nearest = nearestOperationalRegion(downRegion, regions)
    return nearest
      ? { downRegion, optimalRegion: nearest.region, distanceKm: Math.round(nearest.distanceKm) }
      : { downRegion, optimalRegion: null, distanceKm: null }
  }
}
