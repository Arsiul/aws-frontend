import type { SharedResponsibilityModel } from '../../domain/entities'
import type { ISecurityRepository } from '../../domain/repositories'

export class GetSharedResponsibilityUseCase {
  private readonly securityRepository: ISecurityRepository

  constructor(securityRepository: ISecurityRepository) {
    this.securityRepository = securityRepository
  }

  execute(): Promise<SharedResponsibilityModel> {
    return this.securityRepository.getSharedResponsibility()
  }
}
