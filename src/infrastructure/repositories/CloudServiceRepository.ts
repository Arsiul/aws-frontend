import type { CloudService } from '../../domain/entities'
import type { ICloudServiceRepository } from '../../domain/repositories'
import { simulatedDelay } from '../../shared/utils/async'
import { SERVICES_DATA } from '../data/services.data'

/** Mock implementation backed by static data. Swap for an HttpCloudServiceRepository
 *  once the back-cloudops API exists — nothing outside infrastructure/di needs to change. */
export class CloudServiceRepository implements ICloudServiceRepository {
  async getAll(): Promise<CloudService[]> {
    await simulatedDelay()
    return SERVICES_DATA
  }

  async getById(id: string): Promise<CloudService | undefined> {
    await simulatedDelay()
    return SERVICES_DATA.find((service) => service.id === id)
  }
}
