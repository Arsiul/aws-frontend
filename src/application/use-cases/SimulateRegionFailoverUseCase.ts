import type { FailoverResult, Region } from '../../domain/entities'
import type { IRegionRepository } from '../../domain/repositories'
import { haversineDistanceKm } from '../../shared/utils/geo'

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

    const candidates = regions.filter((r) => r.id !== downRegionId && r.status === 'operational')

    if (candidates.length === 0) {
      return { downRegion, optimalRegion: null, distanceKm: null }
    }

    let optimalRegion = candidates[0]
    let shortestDistance = haversineDistanceKm(downRegion.coordinates, optimalRegion.coordinates)

    for (const candidate of candidates.slice(1)) {
      const distance = haversineDistanceKm(downRegion.coordinates, candidate.coordinates)
      if (distance < shortestDistance) {
        optimalRegion = candidate
        shortestDistance = distance
      }
    }

    return { downRegion, optimalRegion, distanceKm: Math.round(shortestDistance) }
  }
}
