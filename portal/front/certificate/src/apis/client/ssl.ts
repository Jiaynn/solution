/**
 * @file ssl common client
 * @description 适用于返回的数据结构为 {code: 200, data: xx, message: ''} 的 web server 接口
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import { injectable } from 'qn-fe-core/di'
import Client, { InternalOptions } from 'qn-fe-core/client'
import { CommonApiException, CommonClient, Output } from 'portal-base/common/apis/common'

import { errorCodeMsg, ErrorCodeType } from '../../constants/ssl-error'

@injectable()
export class SslClient extends Client {
  private prefix = '/api/certificate/v1'

  constructor(private commonClient: CommonClient) {
    super()
  }

  protected async _send(url: string, options: InternalOptions): Promise<Output> {
    let output: Output
    try {
      output = await this.commonClient.send(this.prefix + url, options)
    } catch (err: unknown) {
      if (err instanceof CommonApiException) {
        throw err.withMessage(errorCodeMsg[err.code as ErrorCodeType])
      }
      throw err
    }
    return output
  }
}
