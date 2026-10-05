import type { SecurityCheckItem } from '../../domain/entities'
import type { IPlanningRepository, ISecurityRepository } from '../../domain/repositories'
import { evaluateSolutionSecurity } from '../../domain/solution'
import { loadActiveProposal } from './PlanningUseCases'

/** Account-level controls, preceded by the controls evaluated on the active solution's design. */
export class GetSecurityChecksUseCase {
  private readonly securityRepository: ISecurityRepository
  private readonly planningRepository: IPlanningRepository

  constructor(securityRepository: ISecurityRepository, planningRepository: IPlanningRepository) {
    this.securityRepository = securityRepository
    this.planningRepository = planningRepository
  }

  async execute(): Promise<SecurityCheckItem[]> {
    const [checks, proposal] = await Promise.all([
      this.securityRepository.getChecks(),
      loadActiveProposal(this.planningRepository),
    ])
    return proposal ? [...evaluateSolutionSecurity(proposal), ...checks] : checks
  }
}
