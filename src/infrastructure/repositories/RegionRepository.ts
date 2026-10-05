import type { Region, RegionConnection } from '../../domain/entities'
import type { IRegionRepository } from '../../domain/repositories'
import { simulatedDelay } from '../../shared/utils/async'
import { REGIONS_DATA, REGION_CONNECTIONS_DATA } from '../data/regions.data'

export class RegionRepository implements IRegionRepository {
  async getAll(): Promise<Region[]> {
    await simulatedDelay()
    return REGIONS_DATA
  }

  async getById(id: string): Promise<Region | undefined> {
    await simulatedDelay()
    return REGIONS_DATA.find((region) => region.id === id)
  }

  async getConnections(): Promise<RegionConnection[]> {
    await simulatedDelay()
    return REGION_CONNECTIONS_DATA
  }
}
