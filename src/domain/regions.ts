// Domain layer: rules about AWS regions shared by failover simulation and multi-region solutions.

import { haversineDistanceKm } from '../shared/utils/geo'
import type { CloudProposal, Region, RegionConnection } from './entities'

/** Closest region (great-circle distance) that is still operational, excluding the origin.
 *  Mirrors how Route 53 latency / geoproximity routing picks a healthy target. */
export function nearestOperationalRegion(
  origin: Region,
  regions: Region[],
): { region: Region; distanceKm: number } | null {
  let best: { region: Region; distanceKm: number } | null = null
  for (const candidate of regions) {
    if (candidate.id === origin.id || candidate.status !== 'operational') continue
    const distanceKm = haversineDistanceKm(origin.coordinates, candidate.coordinates)
    if (!best || distanceKm < best.distanceKm) best = { region: candidate, distanceKm }
  }
  return best
}

/** A critical (multi-region) solution replicates to a secondary region; multi-AZ and standard
 *  designs stay inside one region, so they draw no inter-region link. */
export function solutionSecondaryRegion(proposal: CloudProposal, regions: Region[]): Region | null {
  if (proposal.availabilityLevel !== 'critical') return null
  const primary = regions.find((r) => r.id === proposal.regionId)
  return primary ? (nearestOperationalRegion(primary, regions)?.region ?? null) : null
}

export function solutionReplicationLinks(proposal: CloudProposal, regions: Region[]): RegionConnection[] {
  const secondary = solutionSecondaryRegion(proposal, regions)
  return secondary ? [{ fromRegionId: proposal.regionId, toRegionId: secondary.id, type: 'solution' }] : []
}
