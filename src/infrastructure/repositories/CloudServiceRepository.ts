import type { CloudService } from '../../domain/entities'
import type { ICloudServiceRepository } from '../../domain/repositories'
import { simulatedDelay } from '../../shared/utils/async'
import { SERVICES_DATA } from '../data/services.data'
import { isBlankWorkspace } from '../workspace/workspaceMode'

// The catalog is AWS reference knowledge and is always available; only the example
// "utilization status" is cleared in a blank workspace.
const catalog = () =>
  isBlankWorkspace() ? SERVICES_DATA.map((service) => ({ ...service, status: 'inactive' as const })) : SERVICES_DATA

/** Mock implementation backed by static data. Swap for an HttpCloudServiceRepository
 *  once the back-cloudops API exists — nothing outside infrastructure/di needs to change. */
export class CloudServiceRepository implements ICloudServiceRepository {
  async getAll(): Promise<CloudService[]> {
    await simulatedDelay()
    return catalog()
  }

  async getById(id: string): Promise<CloudService | undefined> {
    await simulatedDelay()
    return catalog().find((service) => service.id === id)
  }
}
