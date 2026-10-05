import type { SecurityCheckItem } from '../../domain/entities'
import type { ISecurityRepository } from '../../domain/repositories'

export class GetSecurityChecksUseCase {
  private readonly securityRepository: ISecurityRepository

  constructor(securityRepository: ISecurityRepository) {
    this.securityRepository = securityRepository
  }

  execute(): Promise<SecurityCheckItem[]> {
    return this.securityRepository.getChecks()
  }
}
