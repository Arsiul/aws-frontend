import type { NetworkArchitecture } from '../../domain/entities'
import type { INetworkRepository } from '../../domain/repositories'

export class GetNetworkArchitectureUseCase {
  private readonly networkRepository: INetworkRepository

  constructor(networkRepository: INetworkRepository) {
    this.networkRepository = networkRepository
  }

  execute(): Promise<NetworkArchitecture> {
    return this.networkRepository.getArchitecture()
  }
}
