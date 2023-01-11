/**
 * @file 计量接口 client
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import { injectable } from 'qn-fe-core/di'
import Client, { Output } from 'qn-fe-core/client'

import BaseProxyClient, { BaseProxyInternalOptions, BaseProxyOptions } from './base-proxy'

interface DefyTrafficOptions extends BaseProxyOptions {}
interface DefyTrafficInternalOptions extends BaseProxyInternalOptions {}

@injectable()
export default class DefyTrafficClient extends Client<unknown, unknown, Output, DefyTrafficOptions> {
  constructor(
    private proxyClient: BaseProxyClient
  ) {
    super()
  }

  prefix = '/defy/traffic'

  protected async _send(url: string, options: DefyTrafficInternalOptions): Promise<Output> {
    return this.proxyClient.send(this.prefix + url, options)
  }
}
