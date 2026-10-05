import type { NetworkArchitecture } from '../../domain/entities'
import type { INetworkRepository, IPlanningRepository, IRegionRepository } from '../../domain/repositories'
import { buildSolutionArchitecture } from '../../domain/solution'
import { loadActiveProposal } from './PlanningUseCases'

/** The active solution's own topology, or the reference architecture when none is active. */
export class GetNetworkArchitectureUseCase {
  private readonly networkRepository: INetworkRepository
  private readonly planningRepository: IPlanningRepository
  private readonly regionRepository: IRegionRepository

  constructor(
    networkRepository: INetworkRepository,
    planningRepository: IPlanningRepository,
    regionRepository: IRegionRepository,
  ) {
    this.networkRepository = networkRepository
    this.planningRepository = planningRepository
    this.regionRepository = regionRepository
  }

  async execute(): Promise<NetworkArchitecture> {
    const proposal = await loadActiveProposal(this.planningRepository)
    if (!proposal) return this.networkRepository.getArchitecture()

    const region = await this.regionRepository.getById(proposal.regionId)
    return buildSolutionArchitecture(proposal, region?.code ?? proposal.regionId)
  }
}
