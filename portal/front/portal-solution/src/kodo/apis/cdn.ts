/**
 * @file config api
 * @description region 相关的接口
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'
import { ApiException } from 'qn-fe-core/client'

import { ProxyClientV2 } from 'portal-base/common/apis/proxy'

import { proxy } from 'kodo/constants/apis'

interface CdnBaseResponse {
  code: number
  error: string
  [k: string]: any
}

export interface RefreshCdnSurplus extends CdnBaseResponse {
  urlQuotaDay: number // url 刷新当日限额
  urlSurplusDay: number // url 刷新当日余量
  dirQuotaDay: number // 目录刷新当日限额
  dirSurplusDay: number // 目录刷新当日余量
  quotaDay: number // 预取当日限额
  surplusDay: number // 预取当日剩余量
}

interface RefreshCdnOptions {
  product: 'cdn'
  urls: string[]
}

export class CdnApiException extends ApiException {
  constructor(
    public code: number,
    public payload: CdnBaseResponse,
    message?: string,
    cause?: unknown
  ) {
    super(
      'RefreshPrefetchApiException',
      code,
      message,
      undefined,
      cause
    )
  }
}

const messageMap = new Map<number, string>([
  [400031, '无效的 URL'],
  [400034, '刷新域名个数超过限制'],
  [400037, 'URL 已在队列中，无需重复提交'],
  [400039, '请求次数过多']
])

function produceResult<T extends CdnBaseResponse>(payload: T) {
  if (payload && typeof payload === 'object' && 'code' in payload && payload.code !== 200) {
    const message = messageMap.get(payload.code) || payload.error
    throw new CdnApiException(payload.code, payload, message)
  }

  return payload
}

@autobind
@injectable()
export class CdnApis {
  constructor(
    private proxyClient: ProxyClientV2
  ) {}

  getRefreshCdnSurplus(): Promise<RefreshCdnSurplus> {
    return this.proxyClient.get<RefreshCdnSurplus>(proxy.refreshCdnSurplus, {})
      .then(produceResult)
  }

  async refreshCdn(params: RefreshCdnOptions): Promise<void> {
    await this.proxyClient.post<CdnBaseResponse>(proxy.refreshCdn, params)
      .then(produceResult)
  }
}
