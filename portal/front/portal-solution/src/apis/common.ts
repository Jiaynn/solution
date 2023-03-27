import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'
import { CommonClient } from 'portal-base/common/apis/common'

import { commonService } from 'constants/api'

@autobind
@injectable()
export class CommonApi {
  constructor(private client: CommonClient) { }

  /**
   * 验证uid是否在白名单
   * @link http://pili-yapi.aslan.qa.qiniu.io/project/98/interface/api/4473
   */
  getLiveWhitelistCheck() {
    return this.client.get<{
      res: boolean
    }>(commonService.getLiveWhitelistCheck)
  }
}
