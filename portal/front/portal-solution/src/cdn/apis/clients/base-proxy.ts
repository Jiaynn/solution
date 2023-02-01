/**
 * @file base proxy for all proxy clients
 * @description 封装指定 api 前缀、扩展 payload 参数能力
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import { injectable } from 'qn-fe-core/di'
import Client, { Output, Options, InternalOptions, canRequestHaveBody } from 'qn-fe-core/client'
import { withQueryParams } from 'qn-fe-core/utils'
import { ProxyClientV2 } from 'portal-base/common/apis/proxy'

import { withOemVendor } from 'cdn/utils/oem'

export interface BaseProxyExtraOptions {
  withProduct?: boolean
}

export interface BaseProxyOptions extends Options, BaseProxyExtraOptions {}
export interface BaseProxyInternalOptions extends InternalOptions, BaseProxyExtraOptions {}

@injectable()
export default class BaseProxyClient extends Client<unknown, unknown, Output, BaseProxyOptions> {
  product: string
  apiPrefix: string

  constructor(
    private proxyClient: ProxyClientV2,
    product: 'cdn' | 'dcdn',
    apiPrefix: '/fusion' | '/dcdn'
  ) {
    super()
    this.product = product
    this.apiPrefix = apiPrefix
  }

  protected _send(url: string, options: BaseProxyInternalOptions = {}): Promise<Output> {
    const { withProduct, ...restOptions } = options
    let realOptions: BaseProxyInternalOptions = withOemVendor(restOptions)
    let realUrl = this.apiPrefix + url

    if (withProduct) {
      if (canRequestHaveBody(realOptions.method)) {
        realOptions = {
          ...realOptions,
          payload: {
            ...realOptions.payload as any,
            product: this.product
          }
        }
      } else {
        realUrl = withQueryParams(realUrl, { product: this.product })
      }
    }

    return this.proxyClient.send(realUrl, realOptions)
  }
}
