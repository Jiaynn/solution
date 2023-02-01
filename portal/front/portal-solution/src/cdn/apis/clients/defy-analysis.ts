/**
 * @file 日志接口 client
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import { injectable } from 'qn-fe-core/di'
import Client, { Output } from 'qn-fe-core/client'

import BaseProxyClient, { BaseProxyInternalOptions, BaseProxyOptions } from './base-proxy'

interface DefyAnalysisOptions extends BaseProxyOptions {}
interface DefyAnalysisInternalOptions extends BaseProxyInternalOptions {}

@injectable()
export default class DefyAnalysisClient extends Client<unknown, unknown, Output, DefyAnalysisOptions> {
  constructor(
    private proxyClient: BaseProxyClient
  ) {
    super()
  }

  prefix = '/defy/analysis'

  protected async _send(url: string, options: DefyAnalysisInternalOptions): Promise<Output> {
    return this.proxyClient.send(this.prefix + url, options)
  }
}
