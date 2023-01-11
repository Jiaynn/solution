/**
 * @file iam 相关配置
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import { injectable } from 'qn-fe-core/di'
import { actions, IamService } from 'portal-base/user/iam'

export type CdnIamActions = typeof actions[IamService.Cdn]
export type DcdnIamActions = typeof actions[IamService.Dcdn]

@injectable()
export default class IamInfo {
  /** iam 服务 */
  iamService: IamService.Cdn | IamService.Dcdn

  constructor(iamService: IamService.Cdn | IamService.Dcdn) {
    this.iamService = iamService
  }

  get iamActions() {
    return actions[this.iamService]
  }

  mustCdnIamActions() {
    if (this.iamService !== IamService.Cdn) {
      throw new Error('请使用 cdn iamActions ')
    }

    return this.iamActions as CdnIamActions
  }

  mustDcdnIamActions() {
    if (this.iamService !== IamService.Dcdn) {
      throw new Error('请使用 dcdn iamActions ')
    }

    return this.iamActions as DcdnIamActions
  }
}
