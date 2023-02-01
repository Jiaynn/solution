/**
 * @file proe proxy client
 * @author yinxulai <yinxulai@qiniu.com>
 */

// TODO: 考虑直接复用 kodoProxyClient
// 参考：https://github.com/qbox/portal-base/blob/1c0357e0154c54593d223820b8a4dadaf452a7a4/common/apis/proxy/client.ts#L42

import { injectable } from 'qn-fe-core/di'
import Client, { InternalOptions, ApiException, ReqInfo } from 'qn-fe-core/client'

import { HttpErrorCode } from 'portal-base/common/apis/common'
import { ProxyClient, Output, HttpException } from 'portal-base/common/apis/proxy'
import Monitor from 'portal-base/common/monitor'

import { ErrorName, errorMessages } from 'kodo/constants/apis/proe-error'

export interface ProeProxyError {
  error: ErrorName
}

export function isProeProxyErrorWithCode(errPayload: any): errPayload is ProeProxyError {
  return !!(errPayload && errPayload.error && typeof errPayload.error === 'string')
}

export function getPayloadMessage(payload: ProeProxyError): string | undefined {
  return isProeProxyErrorWithCode(payload) ? errorMessages[payload.error] ?? undefined : undefined
}

/** http / https 请求 response status code 非 2xx，带解析 response body 后 `ProeProxyError` 类型的 `payload` */
export class ProeProxyApiException extends ApiException {
  declare public code: string

  constructor(
    /** http status code */
    public httpCode: HttpErrorCode,
    /** 解析 response body 后 `ProeProxyError` 类型的 `payload` */
    public payload: ProeProxyError,
    /** `window.fetch` 返回的原生 `Response` */
    public response: Response,
    /** 请求相关基本信息 */
    public reqInfo: ReqInfo,
    /** 能给用户看的异常信息 */
    message?: string,
    /** 异常的上游 */
    cause?: HttpException
  ) {
    super(
      'ProeProxyApiException',
      isProeProxyErrorWithCode(payload) ? payload.error : String(httpCode),
      message ?? getPayloadMessage(payload),
      undefined, // 定制自己的 map message 逻辑，干脆不用
      cause
    )
  }
}

@injectable()
export class ProeProxyClient extends Client {

  constructor(private proxyClient: ProxyClient, monitor: Monitor) {
    super()

    monitor.collectFromClient('ProeProxyClient', this)
  }

  protected async _send(url: string, options: InternalOptions): Promise<Output> {
    try {
      return await this.proxyClient.send(url, options)
    } catch (err: unknown) {
      if (!(err instanceof HttpException)) {
        throw err
      }

      const payload = err.payload as ProeProxyError
      const message = getPayloadMessage(payload) ?? err.message

      throw new ProeProxyApiException(
        err.code,
        payload,
        err.response,
        err.reqInfo,
        message,
        err
      )
    }
  }

}
