/**
 * @file ssl proxy client
 * @description 适用于返回原始数据结构（即未用 code/data/message 包裹）的 portal proxy 接口
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import { injectable } from 'qn-fe-core/di'
import Client, { InternalOptions, ApiException } from 'qn-fe-core/client'
import { ProxyClient, HttpException, Output } from 'portal-base/common/apis/proxy'

import { errorCodeMsg, ErrorCodeType } from '../../constants/ssl-error'

interface SslProxyErrorResult {
  code: ErrorCodeType
  error?: string
}

function isSslProxyError(err: any): err is SslProxyErrorResult {
  return !!(err && err.code && typeof err.code === 'number')
}

export class SslProxyApiException extends ApiException {
  constructor(
    public code: number,
    public payload: SslProxyErrorResult,
    public jsonOutput: Output,
    message?: string,
    cause?: unknown
  ) {
    super(
      'SslProxyApiException',
      code,
      message,
      errorCodeMsg,
      cause
    )
  }
}

@injectable()
export class SslProxyClient extends Client {
  private prefix = '/cert/portal'

  constructor(private proxyClient: ProxyClient) {
    super()
  }

  protected async _send(url: string, options: InternalOptions): Promise<Output> {
    let output: Output

    try {
      output = await this.proxyClient.send(this.prefix + url, options)
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw err.withMessage(errorCodeMsg[err.code as ErrorCodeType])
      }
      throw err
    }

    const { payload } = output

    if (isSslProxyError(payload)) {
      throw new SslProxyApiException(payload.code, payload, output, errorCodeMsg[payload.code])
    }

    return output
  }
}
