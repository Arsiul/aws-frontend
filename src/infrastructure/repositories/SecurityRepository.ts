import type { IamIdentity, SecurityCheckItem, SharedResponsibilityModel } from '../../domain/entities'
import type { ISecurityRepository } from '../../domain/repositories'
import { simulatedDelay } from '../../shared/utils/async'
import { IAM_IDENTITIES_DATA, SHARED_RESPONSIBILITY_DATA } from '../data/iam.data'
import { SECURITY_CHECKS_DATA } from '../data/security.data'

export class SecurityRepository implements ISecurityRepository {
  async getChecks(): Promise<SecurityCheckItem[]> {
    await simulatedDelay()
    return SECURITY_CHECKS_DATA
  }

  async getIamIdentities(): Promise<IamIdentity[]> {
    await simulatedDelay()
    return IAM_IDENTITIES_DATA
  }

  async getSharedResponsibility(): Promise<SharedResponsibilityModel> {
    await simulatedDelay()
    return SHARED_RESPONSIBILITY_DATA
  }
}
