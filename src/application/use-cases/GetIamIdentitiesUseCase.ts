import type { IamIdentity } from '../../domain/entities'
import type { ISecurityRepository } from '../../domain/repositories'

export class GetIamIdentitiesUseCase {
  private readonly securityRepository: ISecurityRepository

  constructor(securityRepository: ISecurityRepository) {
    this.securityRepository = securityRepository
  }

  execute(): Promise<IamIdentity[]> {
    return this.securityRepository.getIamIdentities()
  }
}
