import type { NetworkArchitecture } from '../../domain/entities'
import type { INetworkRepository } from '../../domain/repositories'
import { simulatedDelay } from '../../shared/utils/async'
import { NETWORK_ARCHITECTURE_DATA } from '../data/network.data'

export class NetworkRepository implements INetworkRepository {
  async getArchitecture(): Promise<NetworkArchitecture> {
    await simulatedDelay()
    return NETWORK_ARCHITECTURE_DATA
  }
}
