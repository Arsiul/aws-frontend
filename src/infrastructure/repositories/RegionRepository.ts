import type { RegionConnection } from '../../domain/entities'
import type { IRegionRepository } from '../../domain/repositories'
import { simulatedDelay } from '../../shared/utils/async'
import type { Region } from '../../domain/entities'
import { REGIONS_DATA, REGION_CONNECTIONS_DATA } from '../data/regions.data'
import { isBlankWorkspace } from '../workspace/workspaceMode'

// Regions are AWS reference data; their example incidents and deployments are not, so a blank
// workspace sees every region healthy and empty.
const blankRegion = (region: Region): Region => ({
  ...region,
  status: 'operational',
  servicesDeployed: [],
  availabilityZones: region.availabilityZones.map((az) => ({ ...az, status: 'operational' })),
})
const regions = () => (isBlankWorkspace() ? REGIONS_DATA.map(blankRegion) : REGIONS_DATA)

export class RegionRepository implements IRegionRepository {
  async getAll(): Promise<Region[]> {
    await simulatedDelay()
    return regions()
  }

  async getById(id: string): Promise<Region | undefined> {
    await simulatedDelay()
    return regions().find((region) => region.id === id)
  }

  async getConnections(): Promise<RegionConnection[]> {
    await simulatedDelay()
    // The inter-region links stand for AWS's own global backbone, so they are AWS reference data
    // and show in every workspace (blank included), unlike the example incidents above.
    return REGION_CONNECTIONS_DATA
  }
}
