import { CommonClient } from 'portal-base/common/apis/common'
import autobind from 'autobind-decorator'

import { injectable } from 'qn-fe-core/di'

import { GetMessageListOptions, GetMessageListResult } from './_types/messageType'
import { messageService } from 'constants/api'

@autobind
@injectable()
export class MessageSolutionApi {
  constructor(private solutionCommonClient: CommonClient) { }

  /**
   * @desc 获取消息列表
   * @url /unifiedmessage/list
   * @param options
   * @returns
   */
  getMessageList(options: GetMessageListOptions): Promise<GetMessageListResult> {
    return this.solutionCommonClient.post(`${messageService.getMessageList}`, options)
  }
}
