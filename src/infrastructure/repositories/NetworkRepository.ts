import type { NetworkArchitecture } from '../../domain/entities'
import type { INetworkRepository } from '../../domain/repositories'
import { simulatedDelay } from '../../shared/utils/async'
import { NETWORK_ARCHITECTURE_DATA } from '../data/network.data'
import { isBlankWorkspace } from '../workspace/workspaceMode'

const EMPTY_ARCHITECTURE: NetworkArchitecture = {
  solutionName: null,
  vpcCidr: '10.0.0.0/16',
  notes: [],
  nodes: [],
  connections: [],
  subnets: [],
  securityGroups: [],
}

export class NetworkRepository implements INetworkRepository {
  async getArchitecture(): Promise<NetworkArchitecture> {
    await simulatedDelay()
    return isBlankWorkspace() ? EMPTY_ARCHITECTURE : NETWORK_ARCHITECTURE_DATA
  }
}
