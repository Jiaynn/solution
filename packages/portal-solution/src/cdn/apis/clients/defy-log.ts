/**
 * @file 日志下载接口 client
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import { injectable } from 'qn-fe-core/di'
import Client, { Output } from 'qn-fe-core/client'

import BaseProxyClient, { BaseProxyInternalOptions, BaseProxyOptions } from './base-proxy'

interface DefyLogOptions extends BaseProxyOptions {}
interface DefyLogInternalOptions extends BaseProxyInternalOptions {}

@injectable()
export default class DefyLogClient extends Client<unknown, unknown, Output, DefyLogOptions> {
  constructor(
    private proxyClient: BaseProxyClient
  ) {
    super()
  }

  prefix = '/defy/log'

  protected async _send(url: string, options: DefyLogInternalOptions): Promise<Output> {
    return this.proxyClient.send(this.prefix + url, options)
  }
}
