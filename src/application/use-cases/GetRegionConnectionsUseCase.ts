import type { RegionConnection } from '../../domain/entities'
import { solutionReplicationLinks } from '../../domain/regions'
import type { IPlanningRepository, IRegionRepository } from '../../domain/repositories'
import { loadActiveProposal } from './PlanningUseCases'

/** Reference replication topology plus the active solution's own multi-region link (if critical). */
export class GetRegionConnectionsUseCase {
  private readonly regionRepository: IRegionRepository
  private readonly planningRepository: IPlanningRepository

  constructor(regionRepository: IRegionRepository, planningRepository: IPlanningRepository) {
    this.regionRepository = regionRepository
    this.planningRepository = planningRepository
  }

  async execute(): Promise<RegionConnection[]> {
    const [connections, regions, proposal] = await Promise.all([
      this.regionRepository.getConnections(),
      this.regionRepository.getAll(),
      loadActiveProposal(this.planningRepository),
    ])
    return proposal ? [...connections, ...solutionReplicationLinks(proposal, regions)] : connections
  }
}
